import SpaceObjectData from "./spaceObject";
import {Object3D} from "three";

class ObjectsStorage {
    private _allObjects: Object3D[] = []
    private _spaceBodiesObjects: { body: Object3D, data: SpaceObjectData }[] = []

    addSpaceObject(object: Object3D, objectData: SpaceObjectData): void {
        this._spaceBodiesObjects.push(
            {
                body: object,
                data: objectData,
            }
        )
        this._allObjects.push(object)
    }

    addObject(object: Object3D): void {
        this._allObjects.push(object)
    }

    get allObjects(): Object3D[] {
        return this._allObjects
    }

    get spaceBodiesObjects(): Object3D[] {
        const bodies = []
        for (const object of this._spaceBodiesObjects) {
            bodies.push(object.body)
        }
        return bodies
    }

    getSpaceObjectData(object: Object3D): SpaceObjectData | null {
        for (const spaceObject of this._spaceBodiesObjects) {
            if (object == spaceObject.body) {
                return spaceObject.data
            }
        }
        return null
    }

}

export default ObjectsStorage