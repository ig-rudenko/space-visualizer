import {julianIntToDate} from "./misc";
import {Vector3} from "three";

class SpaceObjectData {
    private _basePoint: [number, number, number] = [0, 0, 0];
    private _scale: number = 1;
    private inclinationSinus: number;

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
        public obliquityToOrbit: number
    ) {
        this.inclinationSinus = Math.sin((Math.PI / 180) * this.inclination);
    }

    static fromEphemerisResult(ephemerisResult: string): SpaceObjectData {
        const matchOrZero = (regex: RegExp) => parseFloat((ephemerisResult.match(regex) || [])[1] || "0");

        return new SpaceObjectData(
            matchOrZero(/\bEC\s*=\s*(\d.\d+E[-+]\d+)/),
            matchOrZero(/\bQR\s*=\s*(\d.\d+E[-+]\d+)/) * 1000,
            matchOrZero(/\bAD\s*=\s*(\d.\d+E[-+]\d+)/) * 1000,
            matchOrZero(/\bIN\s*=\s*(\d.\d+E[-+]\d+)/),
            1 / matchOrZero(/\bOM\s*=\s*(\d.\d+E[-+]\d+)/),
            matchOrZero(/\bW\s*=\s*(\d.\d+E[-+]\d+)/),
            matchOrZero(/\bTp\s*=\s*(\d+\.\d+)/),
            matchOrZero(/\bN\s*=\s*(\d.\d+E[-+]\d+)/),
            matchOrZero(/\bMA\s*=\s*(\d.\d+E[-+]\d+)/),
            matchOrZero(/\bTA\s*=\s*(\d.\d+E[-+]\d+)/),
            matchOrZero(/\bA\s*=\s*-?(\d.\d+E[-+]\d+)/) * 1000,
            matchOrZero(/\bPR\s*=\s*(\d.\d+E[-+]\d+)/),
            matchOrZero(/Mean Radius\s+\(km\)\s+=\s+(\d+\.\d+|\d+)/i) * 1000,
            matchOrZero(/Obliquity to orbit,\s+deg\s+=\s+(-?\d+\.\d+)/i),
        );
    }

    get distanceToSun(): number {
        const anglePerSecond = 360 / this.siderealTime;
        const now = new Date();
        const periapsisDatetime = julianIntToDate(this.periapsisTime);
        const secondsFromPeriapsis = Math.abs(
            (now.getTime() - periapsisDatetime.getTime()) / 1000
        );

        const angle = (anglePerSecond * secondsFromPeriapsis * Math.PI) / 180;
        return (
            this.semiMajorAxis *
            (1 - this.eccentricity ** 2) /
            (1 + this.eccentricity * Math.cos(angle))
        );
    }

    getPlanetOrbit3DPoints(numPoints: number): Vector3[] {
        const orbitData: Vector3[] = [];
        const point_angle = 360 / numPoints
        for (let t = 0; t <= 360; t += point_angle) {
            const [xi, yi, zi] = this.getPoint(t);
            orbitData.push(new Vector3(xi, yi, zi));
        }
        return orbitData;
    }

    setBasePoint(basePoint: [number, number, number]): void {
        this._basePoint = basePoint;
    }

    setScale(value: number): void {
        this._scale = value;
    }

    getPoint(angle: number): [number, number, number] {
        angle = +angle;
        const r =
            (this.semiMajorAxis * (1 - this.eccentricity ** 2)) /
            (1 + this.eccentricity * Math.cos((Math.PI / 180) * angle));
        const xi = r * Math.cos((Math.PI / 180) * angle);
        const yi = r * Math.sin((Math.PI / 180) * angle);

        const fromI = angle - this.omega + 90;
        const zi = r * -Math.cos((Math.PI / 180) * fromI) * this.inclinationSinus;
        return [
            (xi + this._basePoint[0]) * this._scale,
            (zi + this._basePoint[1]) * this._scale,
            (yi + this._basePoint[2]) * this._scale,
        ];
    }

    getCurrentPosition(): [number, number, number] {
        return this.getPoint(
            this.omega + this.periapsisArgument + this.trueAnomaly
        );
    }
}

export default SpaceObjectData