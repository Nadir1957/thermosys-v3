import csv,sys
def read(d):
    r=list(csv.reader(open(d+'/eplusout.csv')))
    h=r[0]; hi=[i for i,x in enumerate(h) if 'Sensible Heating Rate' in x][0]; ci=[i for i,x in enumerate(h) if 'Sensible Cooling Rate' in x][0]
    H=[float(x[hi]) for x in r[1:]]; C=[float(x[ci]) for x in r[1:]]
    return H,C
for d in sys.argv[1:]:
    H,C=read(d)
    print(d,'lignes',len(H),'chauffage kWh %.0f'%(sum(H)/1000),'froid kWh %.0f'%(sum(C)/1000),'pointe chauffage kW %.2f'%(max(H)/1000),'pointe froid kW %.2f'%(max(C)/1000))
