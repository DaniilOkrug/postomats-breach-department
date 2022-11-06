import os

if 'LDT_DATASETS_FOLDER' in os.environ:
    root = os.environ['LDT_DATASETS_FOLDER']
else: 
    root = './data/final'

houses = os.path.join(root, 'houses.csv')
metro = os.path.join(root, 'metro.csv')
kiosks = os.path.join(root, 'kiosks.csv')
paper_kiosks = os.path.join(root, 'paper_kiosks.csv')
libs = os.path.join(root, 'libs.csv')
markets = os.path.join(root, 'markets.csv')
mfc = os.path.join(root, 'mfc.csv')
pickpoint = os.path.join(root, 'pickpoint.csv')
sport = os.path.join(root, 'sport.csv')
technoparks = os.path.join(root, 'technoparks.csv')
stationary = os.path.join(root, 'stationary.csv')
domestic_services = os.path.join(root, 'domestic_services.csv')
cultural_houses = os.path.join(root, 'cultural_houses.csv')

