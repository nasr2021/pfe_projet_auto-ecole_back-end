import { Controller } from "@nestjs/common";
import { GerantService } from "./gerant.service";


@Controller('api/gerant')

export class GerantController {
    constructor(private gerantServiceg: GerantService) {}}