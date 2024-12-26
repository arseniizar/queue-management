import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {Roles, RoleSchema} from "src/schemas/roles.schema";
import {RolesService} from "./roles.service";

@Module({
    imports: [
        MongooseModule.forFeature([{name: Roles.name, schema: RoleSchema}]),
    ],
    providers: [RolesService],
    exports: [RolesService],
})
export class RolesModule {
    constructor(private rolesService: RolesService) {
        this.rolesService.initRoles()
            .then(r =>
                console.log("Roles initialized"))
            .catch((err) => {
                console.error("Error initializing roles:", err);
            });
    }
}
