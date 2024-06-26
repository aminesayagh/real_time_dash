import { Schema, model, Model, HydratedDocument, PaginateModel } from 'mongoose';
import { MODEL_NAME, STATE_POSTULATION } from 'shared-ts';
import { Postulation, PostulationContent } from '../types/Models';
import mongoosePagination from 'mongoose-paginate-v2';

interface PostulationContentMethods {}

interface PostulationContentStatics {}

interface PostulationContentVirtual {}

export type PostulationContentModel = Model<PostulationContent, {}, PostulationContentMethods, PostulationContentVirtual> & PostulationContentStatics;
export type HydratedPostulationContent = HydratedDocument<PostulationContent, PostulationContentMethods & PostulationContentVirtual>;

const PostulationContentSchema = new Schema<PostulationContent, PostulationContentModel, PostulationContentMethods, PostulationContentVirtual>({
    postulation_content_body: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    postulation_content_type: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: MODEL_NAME.POSTULATION_TYPE_CONTENT,
    }
}, {
    strict: true,
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
});


interface PostulationMethods {}

interface PostulationStatics {}

interface PostulationVirtual {} 

export type PostulationModel = Model<Postulation, {}, PostulationMethods, PostulationVirtual> & PostulationStatics & PaginateModel<Postulation>;
export type HydratedPostulation = HydratedDocument<Postulation, PostulationMethods & PostulationVirtual>;


const PostulationSchema = new Schema<Postulation, PostulationModel, PostulationMethods, PostulationVirtual>({
    resources_id: {
        type: [Schema.Types.ObjectId],
        ref: MODEL_NAME.RESOURCE,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: MODEL_NAME.USER,
    },
    postulation_department_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: MODEL_NAME.DEPARTMENT,  // Ensure this reference is correct
    },
    postulation_state: {
        type: String,
        required: true,
        enum: Object.values(STATE_POSTULATION),
        default: STATE_POSTULATION.ON_HOLD,
    },
    postulation_type: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: MODEL_NAME.POSTULATION,
    },
    postulation_content: [PostulationContentSchema]
}, {
    strict: true,
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
});

PostulationSchema.plugin(mongoosePagination as any);

const Postulation = model<Postulation, PostulationModel>(MODEL_NAME.POSTULATION, PostulationSchema);

export default Postulation;