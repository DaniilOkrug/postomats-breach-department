import requests
import pandas as pd
import sys

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Required two args: DATASET_NO\tOUTPUT_FILE_NAME")
        exit(1)


    INFO_ENDPOINT = f"https://apidata.mos.ru/v1/datasets/{sys.argv[1]}"
    DATA_ENDPOINT = f"https://apidata.mos.ru/v1/datasets/{sys.argv[1]}/rows"
    COUNT_ENDPOINT = f"https://apidata.mos.ru/v1/datasets/{sys.argv[1]}/count"


    print(f"Requesting {INFO_ENDPOINT}")
    response = requests.get(INFO_ENDPOINT, {'api_key': '746fd1fb4a3e32bcbee3f5cf9d847b53'})
    print(f"Status: {response.status_code}")
    response = response.json()

    data = pd.DataFrame(columns=[
        *map(lambda x: x['Name'], response['Columns']), 'x', 'y'
    ])

    print(f"Requesting {COUNT_ENDPOINT}")
    item_count = requests.get(COUNT_ENDPOINT, {'api_key': '746fd1fb4a3e32bcbee3f5cf9d847b53'})
    print(f"Status: {item_count.status_code}")

    for i in range(0, item_count.json(), 1000):
        print(f"Requesting {DATA_ENDPOINT}")
        data_response = requests.get(DATA_ENDPOINT, {'api_key': '', '$skip': i, '$top': 1000})
        print(f"Status: {data_response.status_code}")
        print(data_response.request.url)
        data_response = data_response.json()

        for entry in data_response:
            entry_data = entry['Cells']
            if entry_data['geoData']['type'] == 'Point':
                x = entry_data['geoData']['coordinates'][0]
                y = entry_data['geoData']['coordinates'][1]
            elif entry_data['geoData']['type'] == 'MultiPoint':
                x = entry_data['geoData']['coordinates'][0][0]
                y = entry_data['geoData']['coordinates'][0][1]
            entry_data['x'] = x
            entry_data['y'] = y
            data = pd.concat([data, pd.DataFrame([entry_data])], ignore_index=True)
    print(data.head())
    data.to_csv(sys.argv[2])
