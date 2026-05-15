"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserProductDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_user_product_dto_1 = require("./create-user-product.dto");
class UpdateUserProductDto extends (0, mapped_types_1.PartialType)(create_user_product_dto_1.CreateUserProductDto) {
}
exports.UpdateUserProductDto = UpdateUserProductDto;
//# sourceMappingURL=update-user-product.dto.js.map