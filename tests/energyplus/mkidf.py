import sys,json
# Generateur IDF equivalent a la maison par defaut de l'application (module horaire)
def mats():
    wall=[(0.015,0.57,1150,1000),(0.1,0.4,900,900),('R',0.18),(0.15,0.4,900,900),(0.02,1.0,1800,1000)]  # int->ext
    roof=[(0.015,0.57,1150,1000),(0.2,1.2,1500,1000),(0.06,1.15,1800,1000),(0.012,0.23,1100,1000)]
    floor=[(0.12,1.4,2000,1000),(1.0,1.5,1800,1000)]
    return wall,roof,floor
def build(wins='0',rins='0',wabs='0.6',rabs='0.6',aw='8,3,3,3',rain='No',extra='0',fixed='0',outside='DOE-2',solar='FullInteriorAndExterior',inside='TARP',epw_mean=18.1634,terrain='Suburbs',rough='MediumRough',tstep=4):
    epw_mean=float(epw_mean); wall,roof,floor=mats(); o=[]
    wins=float(wins); rins=float(rins); wabs=float(wabs); rabs=float(rabs); AW=[float(x) for x in aw.split(',')]
    if wins>0: wall=wall+[(wins/100,0.036,20,1450)]
    if rins>0: roof=roof+[(rins/100,0.036,20,1450)]
    a=o.append
    a('Version,23.2;')
    a(f'Building,Maison,0,{terrain},0.04,0.4,{solar},25;')
    a('Timestep,%d;'%tstep)
    a('GlobalGeometryRules,UpperLeftCorner,Counterclockwise,World;')
    a(f'SurfaceConvectionAlgorithm:Outside,{outside};')
    a(f'SurfaceConvectionAlgorithm:Inside,{inside};')
    a('HeatBalanceAlgorithm,ConductionTransferFunction;')
    a('SimulationControl,No,No,No,No,Yes;')
    a(f'RunPeriod,Annee,1,1,,12,31,,Sunday,Yes,Yes,No,{rain},{rain};')
    a('Site:GroundTemperature:BuildingSurface,'+','.join([f'{epw_mean:.3f}']*12)+';')
    a('Site:GroundReflectance,'+','.join(['0.2']*12)+';')
    def mat(name,l,sol):
        if l[0]=='R': a(f'Material:AirGap,{name},{l[1]};'); return
        d,k,rho,cp=l
        a(f'Material,{name},{rough},{d},{k},{rho},{cp},0.9,{sol},0.6;')
    def cons(name,layers,sol,tag):
        names=[]
        for i,l in enumerate(layers):
            mat(f'{tag}{i}',l,sol); names.append(f'{tag}{i}')
        a(f'Construction,{name},'+','.join(reversed(names))+';')
    cons('CWall',wall,wabs,'MW'); cons('CRoof',roof,rabs,'MR'); cons('CFloor',floor,0.6,'MF')
    a('WindowMaterial:SimpleGlazingSystem,Verre,2.8,0.75,0.8;')
    a('Construction,CWin,Verre;')
    a('Zone,Z1,0,0,0,0,1,1,2.7,216;')
    def win(n,area):
        h=2.0 if (n=='S' and area>=6) else 1.5; wdt=area/h
        if n=='S': c=5; return [(c-wdt/2,0,.35+h),(c-wdt/2,0,.35),(c+wdt/2,0,.35),(c+wdt/2,0,.35+h)]
        if n=='E': c=4; return [(10,c-wdt/2,.6+h),(10,c-wdt/2,.6),(10,c+wdt/2,.6),(10,c+wdt/2,.6+h)]
        if n=='N': c=5; return [(c+wdt/2,8,.6+h),(c+wdt/2,8,.6),(c-wdt/2,8,.6),(c-wdt/2,8,.6+h)]
        if n=='W': c=4; return [(0,c+wdt/2,.6+h),(0,c+wdt/2,.6),(0,c-wdt/2,.6),(0,c-wdt/2,.6+h)]
    # aw = areas dans l'ordre de l'application : facade 1 = sud, 2 = ouest, 3 = nord, 4 = est
    areas={'S':AW[0],'W':AW[1],'N':AW[2],'E':AW[3]}
    S=[('S',[(0,0,2.7),(0,0,0),(10,0,0),(10,0,2.7)],win('S',areas['S'])),
       ('E',[(10,0,2.7),(10,0,0),(10,8,0),(10,8,2.7)],win('E',areas['E'])),
       ('N',[(10,8,2.7),(10,8,0),(0,8,0),(0,8,2.7)],win('N',areas['N'])),
       ('W',[(0,8,2.7),(0,8,0),(0,0,0),(0,0,2.7)],win('W',areas['W']))]
    def verts(v): return ','.join(f'{x},{y},{z}' for x,y,z in v)
    for n,v,w in S:
        a(f'BuildingSurface:Detailed,Wall{n},Wall,CWall,Z1,,Outdoors,,SunExposed,WindExposed,,4,{verts(v)};')
        a(f'FenestrationSurface:Detailed,Win{n},Window,CWin,Wall{n},,,,,4,{verts(w)};')
    a(f'BuildingSurface:Detailed,Roof,Roof,CRoof,Z1,,Outdoors,,SunExposed,WindExposed,,4,{verts([(0,8,2.7),(0,0,2.7),(10,0,2.7),(10,8,2.7)])};')
    a(f'BuildingSurface:Detailed,Floor,Floor,CFloor,Z1,,Ground,,NoSun,NoWind,,4,{verts([(0,0,0),(0,8,0),(10,8,0),(10,0,0)])};')
    if fixed=='inwin':
        for n in 'SENW':
            a(f'SurfaceProperty:ConvectionCoefficients,Wall{n},Inside,Value,2.2,,;')
            a(f'SurfaceProperty:ConvectionCoefficients,Win{n},Outside,Value,8,,,Inside,Value,3.0,,;')
        a('SurfaceProperty:ConvectionCoefficients,Roof,Inside,Value,1.8,,;')
        a('SurfaceProperty:ConvectionCoefficients,Floor,Inside,Value,2.2,,;')
    if fixed in ('1','out','in'):
        fo=fixed in ('1','out'); fi=fixed in ('1','in')
        def cc(n,ho,hi):
            parts=[]
            if fo and ho is not None: parts.append(f'Outside,Value,{ho},,')
            if fi and hi is not None: parts.append(f'Inside,Value,{hi},,')
            if parts: a(f'SurfaceProperty:ConvectionCoefficients,{n},'+','.join(parts)+';')
        for n in 'SENW':
            cc(f'Wall{n}',11.9,2.2); cc(f'Win{n}',8,3.0)
        cc('Roof',14.4,1.8); cc('Floor',None,2.2)
    a('ZoneInfiltration:DesignFlowRate,Inf,Z1,AlwaysOn,AirChanges/Hour,,,,0.5,1,0,0,0;')
    a('Schedule:Constant,AlwaysOn,Fraction,1;')
    a('Schedule:Compact,Gains,Fraction,Through: 12/31,For: AllDays,Until: 17:00,0.4,Until: 23:00,1.0,Until: 24:00,0.4;')
    a('ElectricEquipment,Gains,Z1,Gains,EquipmentLevel,500,,,0,0.6,0,0;')
    a('Schedule:Compact,SPH,Temperature,Through: 12/31,For: AllDays,Until: 06:00,16,Until: 23:00,20,Until: 24:00,16;')
    a('Schedule:Constant,SPC,Temperature,26;')
    a('Schedule:Constant,CtlType,Any Number,4;')
    a('ThermostatSetpoint:DualSetpoint,DualSP,SPH,SPC;')
    a('ZoneControl:Thermostat,Z1 Thermostat,Z1,CtlType,ThermostatSetpoint:DualSetpoint,DualSP;')
    a('ZoneControl:Thermostat:OperativeTemperature,Z1 Thermostat,Constant,0.5,;')
    a('ZoneHVAC:IdealLoadsAirSystem,IdealZ1,,Z1 Supply,,,50,13,0.0156,0.0077,NoLimit,,,NoLimit,,,,,None,,None;')
    a('ZoneHVAC:EquipmentList,Z1 Equip,SequentialLoad,ZoneHVAC:IdealLoadsAirSystem,IdealZ1,1,1,,;')
    a('ZoneHVAC:EquipmentConnections,Z1,Z1 Equip,Z1 Supply,,Z1 Node,Z1 Return;')
    if extra=='1':
        for sn in ['WallS','WallE','WallN','WallW','Roof']:
            for v in ['Surface Outside Face Convection Heat Transfer Coefficient','Surface Outside Face Temperature','Surface Outside Face Outdoor Air Wind Speed','Surface Outside Face Outdoor Air Drybulb Temperature']:
                a(f'Output:Variable,{sn},{v},Hourly;')
        a('Output:Variable,*,Site Wind Speed,Hourly;'); a('Output:Variable,*,Site Wind Direction,Hourly;')
    for v in ['Zone Ideal Loads Zone Sensible Heating Rate','Zone Ideal Loads Zone Sensible Cooling Rate','Zone Operative Temperature','Zone Mean Air Temperature']:
        a(f'Output:Variable,*,{v},Hourly;')
    a('Output:SQLite,SimpleAndTabular;') if False else None
    return '\n'.join(o)+'\n'
if __name__=='__main__':
    kw=dict(a.split('=') for a in sys.argv[2:])
    open(sys.argv[1],'w').write(build(**kw))
