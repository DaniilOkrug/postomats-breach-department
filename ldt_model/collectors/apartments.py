import sys
import pandas as pd
import geocoder as g

if __name__ == "__main__":
    print("Caution! The number of requests is highly limited. Please, double-check the input arguments and write \"Okay, proceed\"")
    proceed = input(": ")
    if proceed == "Okay, proceed":
        if len(sys.argv) <= 4:
            print("Invalid arguments")
            exit(1)
        df = pd.read_csv(sys.argv[1])
        if '--first-run' in sys.argv:
            df.insert(len(df.columns), 'x', None, True)
            df.insert(len(df.columns), 'y', None, True)
        l, r = int(sys.argv[2]), int(sys.argv[3])
        for i in range(l, 1 + r):
            print(f"Proceeding row: {i}\r")
            coordinates = g.google(df.iloc[i, :]['Адрес ОЖФ'], key="")
            df.at[i, 'y'] = coordinates.latlng[0]
            df.at[i, 'x'] = coordinates.latlng[1]
        df.to_csv(f"{sys.argv[1].split('.csv')[0]}_coordinates.csv")
    else:
        print("Aborting...")