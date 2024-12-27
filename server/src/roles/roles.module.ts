import {Global, Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {Roles, RoleSchema} from "src/schemas/roles.schema";
import {RolesService} from "./roles.service";

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([{name: Roles.name, schema: RoleSchema}]),
    ],
    providers: [RolesService],
    exports: [RolesService],
})
export class RolesModule {
}
