import { Controller } from "@nestjs/common";
import { DemandeService } from "./demande.service";

@Controller('api/demande')

export class DemandeController {
    constructor(private demandeService: DemandeService) {}}
    