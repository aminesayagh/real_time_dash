import { Schema, model, Types } from 'mongoose';
import { PaginateModel } from 'mongoose';
import { DefaultDocument } from 'types/Mongoose';
import { MODEL_NAME } from '../constants/DB';
import mongoosePagination from 'mongoose-paginate-v2';

export interface IDepartment {
    department_name: string;
    responsible_id: Types.ObjectId;
}

export interface IDepartmentDocument extends DefaultDocument<IDepartment> {};

export interface IDepartmentModel extends PaginateModel<IDepartmentDocument> {};

const DepartmentSchema = new Schema<IDepartmentDocument, IDepartmentModel>({
    department_name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
    },
    responsible_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: MODEL_NAME.USER,
    }
}, {
    strict: true,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

DepartmentSchema.plugin(mongoosePagination as any);

const Department = model<IDepartmentDocument, IDepartmentModel>(MODEL_NAME.DEPARTMENT, DepartmentSchema);

Department.paginate().then();

export default Department; 