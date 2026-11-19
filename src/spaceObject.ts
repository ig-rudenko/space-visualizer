import {julianIntToDate} from "./misc";
import {Vector3} from "three";

export const EPHEMERIS_EPOCH_MS = Date.UTC(2024, 1, 27, 0, 0, 0); // 2460367.500000000 TDB = 2024-Feb-27 00:00:00 UTC

export function solveKepler(M: number, e: number): number {
    const PI2 = Math.PI * 2;
    M = ((M % PI2) + PI2) % PI2;
    let E = M;
    for (let i = 0; i < 15; i++) {
        const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        E -= dE;
        if (Math.abs(dE) < 1e-12) break;
    }
    return E;
}

class SpaceObjectData {
    private _basePoint: [number, number, number] = [0, 0, 0];
    private _scale: number = 1;
    public epochMs: number = EPHEMERIS_EPOCH_MS;

    constructor(
        public eccentricity: number,
        public periapsisDistance: number,
        public apoapsisDistance: number,
        public inclination: number,
        public omega: number,
        public periapsisArgument: number,
        public periapsisTime: number,
        public meanMotion: number,
        public meanAnomaly: number,
        public trueAnomaly: number,
        public semiMajorAxis: number,
        public siderealTime: number,
        public meanRadius: number,
        public obliquityToOrbit: number,
        public ephemeris: string = "",
        public rotationRate: number = 0,
    ) {}

    static fromEphemerisResult(ephemerisResult: string): SpaceObjectData {
        const matchOrZero = (regex: RegExp) => parseFloat((ephemerisResult.match(regex) || [])[1] || "0");

        // Parse obliquity
        let obliquity = matchOrZero(/Obliquity to orbit.*?=\s*(-?\d+\.\d+)\s*deg/i);
        if (!obliquity) {
            if (ephemerisResult.includes("2.11'")) {
                obliquity = 2.11 / 60;
            } else {
                obliquity = matchOrZero(/Obliquity to orbit.*?=\s*(-?\d+\.\d+)/i);
            }
        }

        // Parse rotation rate (rad/s)
        const rotationRate = matchOrZero(/Rot\.\s*Rate.*?[=,]\s*(-?\d+\.\d+E?[-+]?\d*)/i);

        return new SpaceObjectData(
            matchOrZero(/\bEC\s*=\s*(\d\.\d+E[-+]\d+)/),
            matchOrZero(/\bQR\s*=\s*(\d\.\d+E[-+]\d+)/) * 1000,
            matchOrZero(/\bAD\s*=\s*(\d\.\d+E[-+]\d+)/) * 1000,
            matchOrZero(/\bIN\s*=\s*(\d\.\d+E[-+]\d+)/),
            matchOrZero(/\bOM\s*=\s*(\d\.\d+E[-+]\d+)/),
            matchOrZero(/\bW\s*=\s*(\d\.\d+E[-+]\d+)/),
            matchOrZero(/\bTp\s*=\s*(\d+\.\d+)/),
            matchOrZero(/\bN\s*=\s*(\d\.\d+E[-+]\d+)/),
            matchOrZero(/\bMA\s*=\s*(\d\.\d+E[-+]\d+)/),
            matchOrZero(/\bTA\s*=\s*(\d\.\d+E[-+]\d+)/),
            matchOrZero(/\bA\s*=\s*-?(\d\.\d+E[-+]\d+)/) * 1000,
            matchOrZero(/\bPR\s*=\s*(\d\.\d+E[-+]\d+)/),
            matchOrZero(/Mean Radius.+?=\s+(\d+\.\d+|\d+)/i) * 1000,
            obliquity,
            ephemerisResult,
            rotationRate,
        );
    }

    set basePoint(basePoint: [number, number, number]) {
        this._basePoint = basePoint;
    }

    get basePoint(): [number, number, number] {
        return this._basePoint;
    }

    setScale(value: number): void {
        this._scale = value;
    }

    get scale(): number {
        return this._scale;
    }

    updateOrbitalElements(ephemerisText: string): void {
        const matchOrZero = (regex: RegExp) => parseFloat((ephemerisText.match(regex) || [])[1] || "0");
        const jdMatch = ephemerisText.match(/^(\d+\.\d+)\s*=/m) || ephemerisText.match(/(\d{7,}\.\d+)/);
        if (jdMatch) {
            const jd = parseFloat(jdMatch[1]);
            this.epochMs = (jd - 2440587.5) * 86400000;
        }

        const ec = matchOrZero(/\bEC\s*=\s*(\d\.\d+E[-+]\d+)/);
        if (ec) this.eccentricity = ec;

        const qr = matchOrZero(/\bQR\s*=\s*(\d\.\d+E[-+]\d+)/);
        if (qr) this.periapsisDistance = qr * 1000;

        const ad = matchOrZero(/\bAD\s*=\s*(\d\.\d+E[-+]\d+)/);
        if (ad) this.apoapsisDistance = ad * 1000;

        const inc = matchOrZero(/\bIN\s*=\s*(\d\.\d+E[-+]\d+)/);
        if (inc) this.inclination = inc;

        const om = matchOrZero(/\bOM\s*=\s*(\d\.\d+E[-+]\d+)/);
        if (om) this.omega = om;

        const w = matchOrZero(/\bW\s*=\s*(\d\.\d+E[-+]\d+)/);
        if (w) this.periapsisArgument = w;

        const ma = matchOrZero(/\bMA\s*=\s*(\d\.\d+E[-+]\d+)/);
        if (ma) this.meanAnomaly = ma;

        const ta = matchOrZero(/\bTA\s*=\s*(\d\.\d+E[-+]\d+)/);
        if (ta) this.trueAnomaly = ta;

        const n = matchOrZero(/\bN\s*=\s*(\d\.\d+E[-+]\d+)/);
        if (n) this.meanMotion = n;

        const a = matchOrZero(/\bA\s*=\s*-?(\d\.\d+E[-+]\d+)/);
        if (a) this.semiMajorAxis = a * 1000;

        const pr = matchOrZero(/\bPR\s*=\s*(\d\.\d+E[-+]\d+)/);
        if (pr) this.siderealTime = pr;

        const tp = matchOrZero(/\bTp\s*=\s*(\d+\.\d+)/);
        if (tp) this.periapsisTime = tp;
    }

    getTrueAnomalyAtDate(date: Date): number {
        if (this.semiMajorAxis === 0) return 0;
        const deltaSeconds = (date.getTime() - this.epochMs) / 1000;
        const nDeg = this.meanMotion || (this.siderealTime > 0 ? 360 / this.siderealTime : 0);
        let M_deg = (this.meanAnomaly + nDeg * deltaSeconds) % 360;
        if (M_deg < 0) M_deg += 360;
        const M_rad = M_deg * (Math.PI / 180);
        const E = solveKepler(M_rad, this.eccentricity);
        const sinNu = (Math.sqrt(1 - this.eccentricity ** 2) * Math.sin(E)) / (1 - this.eccentricity * Math.cos(E));
        const cosNu = (Math.cos(E) - this.eccentricity) / (1 - this.eccentricity * Math.cos(E));
        let nu_deg = Math.atan2(sinNu, cosNu) * (180 / Math.PI);
        if (nu_deg < 0) nu_deg += 360;
        return nu_deg;
    }

    getPositionFromTrueAnomaly(nu_deg: number): [number, number, number] {
        if (this.semiMajorAxis === 0) {
            return [...this.basePoint];
        }
        const rad = Math.PI / 180;
        const nu = nu_deg * rad;
        const r = (this.semiMajorAxis * (1 - this.eccentricity ** 2)) / (1 + this.eccentricity * Math.cos(nu));
        const theta = (this.periapsisArgument + nu_deg) * rad;
        const om = this.omega * rad;
        const inc = this.inclination * rad;

        const X = r * (Math.cos(om) * Math.cos(theta) - Math.sin(om) * Math.sin(theta) * Math.cos(inc));
        const Y = r * (Math.sin(om) * Math.cos(theta) + Math.cos(om) * Math.sin(theta) * Math.cos(inc));
        const Z = r * (Math.sin(theta) * Math.sin(inc));

        return [
            (X * this._scale) + this.basePoint[0],
            (Z * this._scale) + this.basePoint[1],
            (Y * this._scale) + this.basePoint[2],
        ];
    }

    getPositionAtDate(date: Date): [number, number, number] {
        if (this.semiMajorAxis === 0) return [...this.basePoint];
        const nu = this.getTrueAnomalyAtDate(date);
        return this.getPositionFromTrueAnomaly(nu);
    }

    getCurrentPosition(): [number, number, number] {
        return this.getPositionFromTrueAnomaly(this.trueAnomaly);
    }

    getPoint(angle: number): [number, number, number] {
        return this.getPositionFromTrueAnomaly(angle);
    }

    getPlanetOrbit3DPoints(numPoints: number = 1500): Vector3[] {
        const orbitData: Vector3[] = [];
        const step = 360 / numPoints;
        for (let t = 0; t <= 360; t += step) {
            orbitData.push(new Vector3(...this.getPositionFromTrueAnomaly(t)));
        }
        return orbitData;
    }

    getDistanceAtDate(date: Date): number {
        if (this.semiMajorAxis === 0) return 0;
        const nu = this.getTrueAnomalyAtDate(date) * (Math.PI / 180);
        return (this.semiMajorAxis * (1 - this.eccentricity ** 2)) / (1 + this.eccentricity * Math.cos(nu));
    }

    getOrbitalSpeedAtDate(date: Date): number {
        if (this.semiMajorAxis === 0) return 0;
        const r_m = this.getDistanceAtDate(date);
        const isMoon = this.semiMajorAxis < 1e9;
        const GM = isMoon ? 3.986004418e14 : 1.32712440018e20;
        const v_ms = Math.sqrt(Math.max(0, GM * ((2 / r_m) - (1 / this.semiMajorAxis))));
        return v_ms / 1000;
    }

    get distanceToSun(): number {
        return this.getDistanceAtDate(new Date());
    }
}

export default SpaceObjectData;
