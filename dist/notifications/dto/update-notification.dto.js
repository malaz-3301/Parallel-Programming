"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNotificationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_notification_dto_1 = require("./create-notification.dto");
class UpdateNotificationDto extends (0, mapped_types_1.PartialType)((0, mapped_types_1.OmitType)(create_notification_dto_1.CreateNotificationDto, ['userId'])) {
}
exports.UpdateNotificationDto = UpdateNotificationDto;
//# sourceMappingURL=update-notification.dto.js.map