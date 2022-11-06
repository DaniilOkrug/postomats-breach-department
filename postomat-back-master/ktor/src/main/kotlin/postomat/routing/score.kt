package postomat.routing

import assessRequest
import com.github.doyaaaaaken.kotlincsv.dsl.csvReader
import com.papsign.ktor.openapigen.annotations.Response
import com.papsign.ktor.openapigen.route.path.normal.NormalOpenAPIRoute
import com.papsign.ktor.openapigen.route.path.normal.get
import com.papsign.ktor.openapigen.route.path.normal.post
import com.papsign.ktor.openapigen.route.response.respond
import com.papsign.ktor.openapigen.route.route
import io.github.dellisd.spatialk.geojson.*
import io.github.evanrupert.excelkt.Sheet
import io.github.evanrupert.excelkt.workbook
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import latitudeLongitude
import me.plony.empty.Empty
import me.plony.empty.id
import me.plony.geo.point
import me.plony.postomat.PostomatType
import me.plony.regions.regionOrNull
import stubs.Stubs
import xY
import java.io.File

fun NormalOpenAPIRoute.score() {
    route("/score") {
        post<Unit, Score, Point> { _, point ->
            val xy = Stubs.location.toXY(latitudeLongitude {
                lat = point.lat.toFloat()
                lon = point.long.toFloat()
            })
            val score = Stubs.model.assess(assessRequest {
                points.add(xy)
            }).scoreList.first()
            respond(Score(score.toDouble()))
        }

        route("/heatmap") {
            get<Filter, List<PointScoreWithRegion>> { filter ->
                if (::cache.isInitialized) {
                    respond(cache.map { it.first }.applyFilter(filter) { it })
                } else {
                    pipeline.call.respond(HttpStatusCode.TemporaryRedirect)
                }
            }
        }
        route("/export.xlsx") {
            get<Filter, File> { filter ->
                val data = excelData(filter)
                val workbook =
                    workbook {
                        sheet(name = "Данные") {
                            data.forEach {
                                generateExcelRow(it)
                            }
                        }
                    }.xssfWorkbook
                pipeline.call.respondOutputStream {
                    workbook.write(this)
                }
            }
        }
    }

    CoroutineScope(Dispatchers.IO).launch {
        loadCache()
    }
}

private suspend fun excelData(filter: Filter): List<ExcelData> {
    val regions = Stubs.region.getRegions(Empty.getDefaultInstance())
        .toList().associateBy { it.id }

    val data = cache
        .sortedByDescending { it.first.score }
        .applyFilter(filter) {
            it.first
        }.withIndex().mapNotNull { (index, p) ->
            val (point, address) = p
            val region = regions[point.regionId] ?: return@mapNotNull null
            val parent = regions[region.parentId] ?: return@mapNotNull null
            ExcelData(
                index + 1,
                parent.name,
                region.name,
                point.type,
                "[${point.point.long}, ${point.point.lat}]",
                address ?: "-",
                point.score
            )
      }
    return data
}

private fun Sheet.generateExcelRow(it: ExcelData) {
    row {
        cell(it.number)
        cell(it.ao)
        cell(it.mo)
        cell(
            when (it.type) {
                PostomatType.CulturalHouse -> "Культурный дом"
                PostomatType.DomesticService -> "Бытовой сервис"
                PostomatType.House -> "Дом"
                PostomatType.Kiosk -> "Киоск"
                PostomatType.Lib -> "Библиотека"
                PostomatType.Market -> "Рынок"
                PostomatType.PaperKiosks -> "Бумажный киоск"
                PostomatType.PickPoint -> "Постомат"
                PostomatType.Sport -> "Спортовный центр"
                PostomatType.Stationary -> "Магазин"
                PostomatType.TechnoPark -> "Технопарк"
                PostomatType.UNRECOGNIZED -> ""
            }
        )
        cell(it.coordinate)
        cell(it.address)
        cell(it.score)
    }
}

data class ExcelData(
    val number: Int,
    val ao: String,
    val mo: String,
    val type: PostomatType,
    val coordinate: String,
    val address: String,
    val score: Double,
)

/**
 * Загружает кэш с данными или пересчитывает их на лету.
 * TODO: персистировать данные в базу данных. Сделать это не костыльно
 */
private suspend fun loadCache() {
    cache = if (file.exists())
        Json.decodeFromString<List<PointScoreWithRegion>>(file.readText()).let { points ->
            datasets.flatMap { (f, t) ->
                val csv = csvReader().readAll(File("/dataset/$f").readText())
                if ("Address" in csv[0]) {
                    val i = csv[0].indexOf("Address")
                    val lati = csv[0].indexOf("latitude")
                    val longi = csv[0].indexOf("longitude")
                    if (lati == -1 || longi == -1) return@flatMap listOf()
                    csv.drop(1).map {
                        Point(it[lati].toDouble(), it[longi].toDouble()) to it[i]
                    }
                } else {
                    listOf()
                }
            }.associate { it }.let { addresses ->
                points.map {
                    it to addresses[it.point]
                }
            }
        }
    else {
        datasets.flatMap { (f, t) ->
            val csv = csvReader().readAll(File("/dataset/$f").readText())
            if ("geoData" in csv[0]) {
                val i = csv[0].indexOf("geoData")
                val ai = csv[0].indexOf("Address")
                val xi = csv[0].indexOf("x")
                val yi = csv[0].indexOf("y")
                csv.drop(1).map {
                    Geometry.fromJson(it[i].replace('\'', '"')) to xY {
                        x = it[xi].toFloat()
                        y = it[yi].toFloat()
                    } to it[ai]
                }.let {
                    Stubs.model.assess(assessRequest {
                        points.addAll(it.map { it.first.second })
                    }).scoreList.zip(it).map { (score, p) ->
                        val point = when (val a = p.first.first) {
                            is MultiPoint -> Point(a.coordinates[0].latitude, a.coordinates[0].longitude)
                            is io.github.dellisd.spatialk.geojson.Point -> Point(a.coordinates.latitude, a.coordinates.longitude)
                            else -> error("Unknown ${p.first.first}")
                        }
                        PointScoreWithRegion(
                            point,
                            t,
                            score.toDouble(),
                            Stubs.region.getRegionContaining(point {
                                lat = point.lat
                                long = point.long
                            }).region.id
                        ) to p.second
                    }
                }
            } else {
                val xi = csv[0].indexOf("x")
                val yi = csv[0].indexOf("y")
                csv.drop(1).map {
                    xY {
                        x = it[xi].toFloat()
                        y = it[yi].toFloat()
                    }
                }.let {
                    Stubs.model.assess(assessRequest {
                        points.addAll(it.map { it })
                    }).scoreList.zip(it).map { (score, p) ->
                        val ll = Stubs.location.toLatitudeLongitude(p)
                        PointScoreWithRegion(
                            Point(ll.lat.toDouble(), ll.lon.toDouble()),
                            t,
                            score.toDouble(),
                            Stubs.region.getRegionContaining(point {
                                lat = ll.lat.toDouble()
                                long = ll.lon.toDouble()
                            }).region.id
                        ) to null
                    }
                }
            }
        }.also {
            file.writeText(Json.encodeToString(it))

        }
    }
}

private val datasets = listOf(
    "cultural_houses.csv" to PostomatType.CulturalHouse,
    "domestic_services.csv" to PostomatType.DomesticService,
    "houses.csv" to PostomatType.House,
    "kiosks.csv" to PostomatType.Kiosk,
    "libs.csv" to PostomatType.Lib,
    "markets.csv" to PostomatType.Market,
    "paper_kiosks.csv" to PostomatType.PaperKiosks,
    "pickpoint.csv" to PostomatType.PickPoint,
    "sport.csv" to PostomatType.Sport,
    "stationary.csv" to PostomatType.Stationary,
    "technoparks.csv" to PostomatType.TechnoPark
)

val file = File("cache.json")
lateinit var cache: List<Pair<PointScoreWithRegion, String?>>

@Serializable
@Response("Point on the map with score")
data class PointScoreWithRegion(
    override val point: Point,
    override val type: PostomatType,
    override val score: Double,
    override val regionId: Long
) : PointLike

data class Score(
    val score: Double
)