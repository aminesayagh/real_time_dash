import { Types, Schema, model, PaginateModel } from 'mongoose';
import { MODEL_NAME, STATE_STUDENT_ARRAY, STATE_STUDENT, TStateStudent, stateStudentRole } from 'constants/DB';
import { DefaultDocument } from 'types/Mongoose';
import { ERRORS } from 'src/constants/ERRORS';

interface IStudent {
    user_id: Types.ObjectId;
    cne: string;
    student_number: string;
    state_student: TStateStudent;
}

export interface IStudentModel extends PaginateModel<IStudentDocument> {}

export interface IStudentDocument extends DefaultDocument<IStudent> {
    findByUserId(user_id: Types.ObjectId): Promise<IStudentDocument | null>;
    findByCne(cne: string): Promise<IStudentDocument | null>;
    findByStudentNumber(student_number: string): Promise<IStudentDocument | null>;
    updateStudentRole(state_student: TStateStudent): Promise<IStudentDocument>;
}

const studentSchema = new Schema<IStudentDocument, IStudentModel>({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: MODEL_NAME.USER,
    },
    cne: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 10,
        maxlength: 10,
    },
    student_number: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 10,
        maxlength: 10,
    },
    state_student: {
        type: String,
        required: true,
        enum: STATE_STUDENT_ARRAY,
        default: STATE_STUDENT.ON_HOLD,
    },
}, {
    strict: true,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

studentSchema.statics.findByUserId = async function (user_id: Types.ObjectId) {
    return this.findOne({ user_id });
};

studentSchema.statics.findByCne = async function (cne: string) {
    return this.findOne({ cne });
};

studentSchema.statics.findByStudentNumber = async function (student_number: string) {
    return this.findOne({ student_number });
};

studentSchema.method('updateStudentRole', async function (this: IStudentDocument, state_student: TStateStudent) {
    if (!stateStudentRole.translateState(this.state_student, state_student)) {
        throw new Error(ERRORS.INVALID_STATE_TRANSITION_STUDENT);
    }
    this.state_student = state_student;

    return this.save();
});

studentSchema.index({ user_id: 1 }, { unique: true });

const StudentModel = model<IStudentDocument, IStudentModel>(MODEL_NAME.STUDENT, studentSchema);

export default StudentModel;