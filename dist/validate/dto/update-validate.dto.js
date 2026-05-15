"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateValidateDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_validate_dto_1 = require("./create-validate.dto");
class UpdateValidateDto extends (0, mapped_types_1.PartialType)(create_validate_dto_1.CreateValidateDto) {
}
exports.UpdateValidateDto = UpdateValidateDto;
//# sourceMappingURL=update-validate.dto.js.map