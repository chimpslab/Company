
import { UserDocument } from "../server/models/User";


declare global {
    namespace Express {
        interface User extends UserDocument {}
    }
}
