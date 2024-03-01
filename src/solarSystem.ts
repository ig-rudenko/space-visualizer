import SpaceObjectData from "./spaceObject";

const SUN = SpaceObjectData.fromEphemerisResult("Vol. Mean Radius (km) =  695700.0")
const MERCURY = SpaceObjectData.fromEphemerisResult(
    `*******************************************************************************
         Revised: April 12, 2021             Mercury                            199 / 1
        
         PHYSICAL DATA (updated 2021-Apr-12):
          Vol. Mean Radius (km) =  2440+-1        Density (g cm^-3)     = 5.427
          Mass x10^23 (kg)      =     3.302       Volume (x10^10 km^3)  = 6.085  
          Sidereal rot. period  =    58.6463 d    Sid. rot. rate (rad/s)= 0.00000124001
          Mean solar day        =   175.9421 d    Core radius (km)      = ~1600 
          Geometric Albedo      =     0.106       Surface emissivity    = 0.77+-0.06
          GM (km^3/s^2)         = 22031.86855     Equatorial radius, Re = 2440 km
          GM 1-sigma (km^3/s^2) =                 Mass ratio (Sun/plnt) = 6023682
          Mom. of Inertia       =     0.33        Equ. gravity  m/s^2   = 3.701     
          Atmos. pressure (bar) = < 5x10^-15      Max. angular diam.    = 11.0"   
          Mean Temperature (K)  = 440             Visual mag. V(1,0)    = -0.42 
          Obliquity to orbit[1] =  2.11' +/- 0.1' Hill's sphere rad. Rp = 94.4 
          Sidereal orb. per.    =  0.2408467 y    Mean Orbit vel.  km/s = 47.362 
          Sidereal orb. per.    = 87.969257  d    Escape vel. km/s      =  4.435
                                         Perihelion  Aphelion    Mean
          Solar Constant (W/m^2)         14462       6278        9126
          Maximum Planetary IR (W/m^2)   12700       5500        8000
          Minimum Planetary IR (W/m^2)   6           6           6
        *******************************************************************************
        2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
         EC= 2.056423382048719E-01 QR= 4.600043736787058E+07 IN= 7.003547018647548E+00
         OM= 4.830053772173095E+01 W = 2.919485613696540E+01 Tp=  2460387.192538718693
         N = 4.736523292146832E-05 MA= 2.794111185695979E+02 TA= 2.558317855862489E+02
         A = 5.790897423198078E+07 AD= 6.981751109609097E+07 PR= 7.600511552363332E+06`
)
const VENUS = SpaceObjectData.fromEphemerisResult(
    `*******************************************************************************
         Revised: April 12, 2021                Venus                           299 / 2
         
         PHYSICAL DATA (updated 2020-Oct-19):
          Vol. Mean Radius (km) =  6051.84+-0.01 Density (g/cm^3)      =  5.204
          Mass x10^23 (kg)      =    48.685      Volume (x10^10 km^3)  = 92.843
          Sidereal rot. period  =   243.018484 d Sid. Rot. Rate (rad/s)= -0.00000029924
          Mean solar day        =   116.7490 d   Equ. gravity  m/s^2   =  8.870
          Mom. of Inertia       =     0.33       Core radius (km)      = ~3200
          Geometric Albedo      =     0.65       Potential Love # k2   = ~0.25
          GM (km^3/s^2)         = 324858.592     Equatorial Radius, Re = 6051.893 km
          GM 1-sigma (km^3/s^2) =    +-0.006     Mass ratio (Sun/Venus)= 408523.72
          Atmos. pressure (bar) =  90            Max. angular diam.    =   60.2"
          Mean Temperature (K)  = 735            Visual mag. V(1,0)    =   -4.40
          Obliquity to orbit    = 177.3 deg      Hill's sphere rad.,Rp =  167.1
          Sidereal orb. per., y =   0.61519726   Orbit speed, km/s     =   35.021
          Sidereal orb. per., d = 224.70079922   Escape speed, km/s    =   10.361
                                         Perihelion  Aphelion    Mean
          Solar Constant (W/m^2)         2759         2614       2650
          Maximum Planetary IR (W/m^2)    153         153         153
          Minimum Planetary IR (W/m^2)    153         153         153
        *******************************************************************************
        2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
         EC= 6.748931814975527E-03 QR= 1.074780717217784E+08 IN= 3.394390525298453E+00
         OM= 7.661202703982865E+01 W = 5.527434059866257E+01 Tp=  2460277.065121068154
         N = 1.854333067927339E-05 MA= 1.448896779334469E+02 TA= 1.453314302379854E+02
         A = 1.082083625826589E+08 AD= 1.089386534435395E+08 PR= 1.941398803842646E+07`
)
const EARTH = SpaceObjectData.fromEphemerisResult(
    `*******************************************************************************
         Revised: April 12, 2021                 Earth                              399
         
         GEOPHYSICAL PROPERTIES (revised May 9, 2022):
          Vol. Mean Radius (km)    = 6371.01+-0.02   Mass x10^24 (kg)= 5.97219+-0.0006
          Equ. radius, km          = 6378.137        Mass layers:
          Polar axis, km           = 6356.752          Atmos         = 5.1   x 10^18 kg
          Flattening               = 1/298.257223563   oceans        = 1.4   x 10^21 kg
          Density, g/cm^3          = 5.51              crust         = 2.6   x 10^22 kg
          J2 (IERS 2010)           = 0.00108262545     mantle        = 4.043 x 10^24 kg
          g_p, m/s^2  (polar)      = 9.8321863685      outer core    = 1.835 x 10^24 kg
          g_e, m/s^2  (equatorial) = 9.7803267715      inner core    = 9.675 x 10^22 kg
          g_o, m/s^2               = 9.82022         Fluid core rad  = 3480 km
          GM, km^3/s^2             = 398600.435436   Inner core rad  = 1215 km
          GM 1-sigma, km^3/s^2     =      0.0014     Escape velocity = 11.186 km/s
          Rot. Rate (rad/s)        = 0.00007292115   Surface area:
          Mean sidereal day, hr    = 23.9344695944     land          = 1.48 x 10^8 km
          Mean solar day 2000.0, s = 86400.002         sea           = 3.62 x 10^8 km
          Mean solar day 1820.0, s = 86400.0         Love no., k2    = 0.299
          Moment of inertia        = 0.3308          Atm. pressure   = 1.0 bar
          Mean surface temp (Ts), K= 287.6           Volume, km^3    = 1.08321 x 10^12
          Mean effect. temp (Te), K= 255             Magnetic moment = 0.61 gauss Rp^3
          Geometric albedo         = 0.367           Vis. mag. V(1,0)= -3.86
          Solar Constant (W/m^2)   = 1367.6 (mean), 1414 (perihelion), 1322 (aphelion)
         HELIOCENTRIC ORBIT CHARACTERISTICS:
          Obliquity to orbit, deg  = 23.4392911  Sidereal orb period  = 1.0000174 y
          Orbital speed, km/s      = 29.79       Sidereal orb period  = 365.25636 d
          Mean daily motion, deg/d = 0.9856474   Hill's sphere radius = 234.9       
        *******************************************************************************
        2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
         EC= 1.639957426111826E-02 QR= 1.470308061012795E+08 IN= 5.157264301763251E-03
         OM= 1.680371675998003E+02 W = 2.925553473849498E+02 Tp=  2460311.368181458674
         N = 1.142075082582530E-05 MA= 5.538823311998678E+01 TA= 5.695291317383499E+01
         A = 1.494822513835634E+08 AD= 1.519336966658472E+08 PR= 3.152157029693230E+07`
)
const MARS = SpaceObjectData.fromEphemerisResult(
    `
        *******************************************************************************
         Revised: June 21, 2016                 Mars                            499 / 4
         
         PHYSICAL DATA (updated 2019-Oct-29):
          Vol. mean radius (km) = 3389.92+-0.04   Density (g/cm^3)      =  3.933(5+-4)
          Mass x10^23 (kg)      =    6.4171       Flattening, f         =  1/169.779
          Volume (x10^10 km^3)  =   16.318        Equatorial radius (km)=  3396.19
          Sidereal rot. period  =   24.622962 hr  Sid. rot. rate, rad/s =  0.0000708822 
          Mean solar day (sol)  =   88775.24415 s Polar gravity m/s^2   =  3.758
          Core radius (km)      = ~1700           Equ. gravity  m/s^2   =  3.71
          Geometric Albedo      =    0.150                                              
        
          GM (km^3/s^2)         = 42828.375214    Mass ratio (Sun/Mars) = 3098703.59
          GM 1-sigma (km^3/s^2) = +- 0.00028      Mass of atmosphere, kg= ~ 2.5 x 10^16
          Mean temperature (K)  =  210            Atmos. pressure (bar) =    0.0056 
          Obliquity to orbit    =   25.19 deg     Max. angular diam.    =  17.9"
          Mean sidereal orb per =    1.88081578 y Visual mag. V(1,0)    =  -1.52
          Mean sidereal orb per =  686.98 d       Orbital speed,  km/s  =  24.13
          Hill's sphere rad. Rp =  319.8          Escape speed, km/s    =   5.027
                                         Perihelion  Aphelion    Mean
          Solar Constant (W/m^2)         717         493         589
          Maximum Planetary IR (W/m^2)   470         315         390
          Minimum Planetary IR (W/m^2)    30          30          30
        *******************************************************************************

        2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
           EC= 9.328370302238161E-02 QR= 2.066718248999021E+08 IN= 1.847857388521854E+00
           OM= 4.948957342618561E+01 W = 2.866650397284963E+02 Tp= 2460438.923206833191
           N = 6.065459966239543E-06 MA= 3.225702584125132E+02 TA= 3.154320687131508E+02
           A = 2.279343887264482E+08 AD= 2.491969525529942E+08 PR= 5.935246494144984E+07`
)
const JUPITER = SpaceObjectData.fromEphemerisResult(
    `*******************************************************************************
         Revised: April 12, 2021               Jupiter                              599
         
         PHYSICAL DATA:
          Mass x 10^22 (g)      = 189818722 +- 8817 Density (g/cm^3)  = 1.3262 +- .0003
          Equat. radius (1 bar) = 71492+-4 km       Polar radius (km)     = 66854+-10
          Vol. Mean Radius (km) = 69911+-6          Flattening            = 0.06487
          Geometric Albedo      = 0.52              Rocky core mass (Mc/M)= 0.0261
          Sid. rot. period (III)= 9h 55m 29.71 s    Sid. rot. rate (rad/s)= 0.00017585
          Mean solar day, hrs   = ~9.9259         
          GM (km^3/s^2)         = 126686531.900     GM 1-sigma (km^3/s^2) =  +- 1.2732
          Equ. grav, ge (m/s^2) = 24.79             Pol. grav, gp (m/s^2) =  28.34
          Vis. magnitude V(1,0) = -9.40
          Vis. mag. (opposition)= -2.70             Obliquity to orbit    =  3.13 deg
          Sidereal orbit period = 11.861982204 y    Sidereal orbit period = 4332.589 d
          Mean daily motion     = 0.0831294 deg/d   Mean orbit speed, km/s= 13.0697
          Atmos. temp. (1 bar)  = 165+-5 K          Escape speed, km/s    =  59.5           
          A_roche(ice)/Rp       =  2.76             Hill's sphere rad. Rp = 740
                                         Perihelion   Aphelion     Mean
          Solar Constant (W/m^2)         56           46           51
          Maximum Planetary IR (W/m^2)   13.7         13.4         13.6
          Minimum Planetary IR (W/m^2)   13.7         13.4         13.6
        *******************************************************************************
        2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
           EC= 4.822509252647478E-02 QR= 7.407356615532681E+08 IN= 1.303265987709862E+00
           OM= 1.005341247254163E+02 W = 2.736266669693536E+02 Tp=  2459966.965590192936
           N = 9.618163028176499E-07 MA= 3.328478137659240E+01 TA= 3.647647013460281E+01
           A = 7.782676930615264E+08 AD= 8.157997245697848E+08 PR= 3.742918465255544E+08`
)
const SATURN = SpaceObjectData.fromEphemerisResult(
    `*******************************************************************************
         Revised: January 26, 2022             Saturn                               699
         
         PHYSICAL DATA:
          Mass x10^26 (kg)      = 5.6834          Density (g/cm^3)       =  0.687+-.001
          Equat. radius (1 bar) = 60268+-4 km     Polar radius (km)      = 54364+-10
          Vol. Mean Radius (km) = 58232+-6        Flattening             =  0.09796
          Geometric Albedo      = 0.47            Rocky core mass (Mc/M) =  0.1027
          Sid. rot. period (III)= 10h 39m 22.4s   Sid. rot. rate (rad/s) =  0.000163785 
          Mean solar day, hrs   =~10.656         
          GM (km^3/s^2)         = 37931206.234    GM 1-sigma (km^3/s^2)  = +- 98
          Equ. grav, ge (m/s^2) = 10.44           Pol. grav, gp (m/s^2)  = 12.14+-0.01
          Vis. magnitude V(1,0) = -8.88          
          Vis. mag. (opposition)= +0.67           Obliquity to orbit     = 26.73 deg
          Sidereal orbit period = 29.447498 yr    Sidereal orbit period  = 10755.698 d
          Mean daily motion     = 0.0334979 deg/d Mean orbit velocity    =  9.68 km/s
          Atmos. temp. (1 bar)  = 134+-4 K        Escape speed, km/s    =  35.5          
          Aroche(ice)/Rp        =  2.71           Hill's sphere rad. Rp  = 1100
                                         Perihelion  Aphelion    Mean
          Solar Constant (W/m^2)         16.8        13.6        15.1
          Maximum Planetary IR (W/m^2)    4.7         4.5         4.6
          Minimum Planetary IR (W/m^2)    4.7         4.5         4.6
        *******************************************************************************
        2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
           EC= 5.485312449279910E-02 QR= 1.352846534956769E+09 IN= 2.488371742408174E+00
           OM= 1.136373156712430E+02 W = 3.357727471730254E+02 Tp=  2463490.196422733366
           N = 3.854931440458000E-07 MA= 2.559935754518296E+02 TA= 2.500052722316908E+02
           A = 1.431361167258561E+09 AD= 1.509875799560353E+09 PR= 9.338687485379217E+08`
)
const URANUS = SpaceObjectData.fromEphemerisResult(
    `*******************************************************************************
         Revised: September 30, 2021           Uranus                               799
         
         PHYSICAL DATA:
          Mass x10^24 (kg)      = 86.813          Density (g/cm^3)       =  1.271
          Equat. radius (1 bar) = 25559+-4 km     Polar radius (km)      = 24973+-20
          Vol. Mean Radius (km) = 25362+-12       Flattening             =  0.02293
          Geometric Albedo      = 0.51
          Sid. rot. period (III)= 17.24+-0.01 h   Sid. rot. rate (rad/s) = -0.000101237
          Mean solar day, h     =~17.24           Rocky core mass (Mc/M) =  0.0012        
          GM (km^3/s^2)         = 5793951.256     GM 1-sigma (km^3/s^2)  = +-4.3 
          Equ. grav, ge (m/s^2) =  8.87           Pol. grav, gp (m/s^2)  =   9.19+-0.02
          Visual magnitude V(1,0)= -7.11
          Vis. mag. (opposition)=  +5.52          Obliquity to orbit     = 97.77 deg
          Sidereal orbit period = 84.0120465 y    Sidereal orbit period  = 30685.4 d
          Mean daily motion     = 0.01176904 dg/d Mean orbit velocity    =  6.8 km/s
          Atmos. temp. (1 bar)  =  76+-2 K        Escape speed, km/s     =  21.3           
          Aroche(ice)/Rp        =  2.20           Hill's sphere rad., Rp = 2700
                                         Perihelion   Aphelion    Mean
          Solar Constant (W/m^2)         4.09         3.39        3.71
          Maximum Planetary IR (W/m^2)   0.72         0.55        0.63
          Minimum Planetary IR (W/m^2)   0.72         0.55        0.63
        *******************************************************************************
        2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
           EC= 4.463472614159238E-02 QR= 2.758819680413041E+09 IN= 7.711428177375869E-01
           OM= 7.406140316480688E+01 W = 9.068305519881442E+01 Tp=  2469665.640008967835
           N = 1.345107930543515E-07 MA= 2.519395038832322E+02 TA= 2.471650024592442E+02
           A = 2.887711910724022E+09 AD= 3.016604141035004E+09 PR= 2.676365158701694E+09`
)
const NEPTUNE = SpaceObjectData.fromEphemerisResult(
    `*******************************************************************************
         Revised: April 22, 2021              Neptune                               899
         
         PHYSICAL DATA (update 2021-May-03):
          Mass x10^24 (kg)      = 102.409         Density (g/cm^3)       =  1.638
          Equat. radius (1 bar) = 24766+-15 km    Volume, 10^10 km^3     = 6254     
          Vol. mean radius (km) = 24624+-21       Polar radius (km)      = 24342+-30
          Geometric Albedo      = 0.41            Flattening             =  0.0171
          Sid. rot. period (III)= 16.11+-0.01 hr  Sid. rot. rate (rad/s) =  0.000108338 
          Mean solar day, h     =~16.11 h         
          GM (km^3/s^2)         = 6835099.97      GM 1-sigma (km^3/s^2)  = +-10 
          Equ. grav, ge (m/s^2) = 11.15           Pol. grav, gp (m/s^2)  = 11.41+-0.03
          Visual magnitude V(1,0)= -6.87
          Vis. mag. (opposition)=  +7.84          Obliquity to orbit     = 28.32 deg
          Sidereal orbit period = 164.788501027 y Sidereal orbit period  = 60189 d
          Mean daily motion     = 0.006020076dg/d Mean orbit velocity    =  5.43 km/s 
          Atmos. temp. (1 bar)  =  72+-2 K        Escape speed (1 bar)  =  23.5 km/s     
          Aroche(ice)/Rp        =  2.98           Hill's sphere rad., Rp = 4700
                                         Perihelion  Aphelion    Mean
          Solar Constant (W/m^2)         1.54        1.49        1.51
          Maximum Planetary IR (W/m^2)   0.52        0.52        0.52
          Minimum Planetary IR (W/m^2)   0.52        0.52        0.52
        *******************************************************************************
        2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
           EC= 1.392748169118928E-02 QR= 4.461653632559234E+09 IN= 1.769627319905752E+00
           OM= 1.317663829477112E+02 W = 2.610516006353576E+02 Tp=  2466268.335760582704
           N = 6.858184078703230E-08 MA= 3.250347685652694E+02 TA= 3.241069609733041E+02
           A = 4.524670903729584E+09 AD= 4.587688174899934E+09 PR= 5.249202935772907E+09`
)

export {SUN, MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE}
