import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import mongoose, {isValidObjectId, Model} from "mongoose";
import {Roles, RolesDocument} from "src/schemas/roles.schema";
import {RolesDto} from "@/dto";

@Injectable()
export class RolesService {
    constructor(
        @InjectModel(Roles.name) private rolesModel: Model<RolesDocument>
    ) {
    }

    async initRoles() {
        const allRoles = await this.rolesModel.find();
        if (allRoles.length && allRoles.length !== 3) {
            throw new HttpException(
                `YOU HAVE MORE OR LESS ROLES THAN IT NEED TO BE`,
                HttpStatus.CONFLICT
            );
        }
        const isRolesExists = allRoles?.filter(
            (role) =>
                role.name === "admin" ||
                role.name === "client" ||
                role.name === "employee"
        );
        allRoles?.forEach((role) => {
            if (!mongoose.isValidObjectId(role._id)) {
                throw new HttpException(
                    `${role.name} have invalid ObjectId - ${role._id}`,
                    HttpStatus.CONFLICT
                );
            }
        });
        if (isRolesExists.length === 3 && allRoles.length === 3) return;
        const roles = [
            {name: "admin", permissions: "all"},
            {name: "client", permissions: "all"},
            {name: "employee", permissions: "all"},
        ];
        await this.rolesModel.insertMany(roles);
    }

    async findRoles(rolesDto: RolesDto) {
        return this.rolesModel.findOne({name: rolesDto.name});
    }

    async findById(id: string) {
        return this.rolesModel.findById(id);
    }

    async isObjectIdValid(id: string) {
        if (isValidObjectId(id)) {
            return String(new mongoose.Types.ObjectId(id)) === id;
        } else {
            return false;
        }
    }
}
