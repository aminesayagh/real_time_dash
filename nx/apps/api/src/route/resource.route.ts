import express from 'express';
import { ERRORS } from '../constants/MESSAGE';
import { ApiRequest, ApiResponse, IApiDeleteResponse } from 'types/Api';
import multer from 'multer';
import { v2 as cloud } from 'cloudinary';
import DataUriParser from 'datauri/parser';
import path from 'path';
import z from 'zod';
import { STATE_RESOURCE, zModelName,  } from 'shared-ts';
import mongoose, { Types } from 'mongoose';

import ResourceModel from '../model/Resource.model';
import {  IAttachmentDocument, IResourceDocument, AttachmentObject } from 'types/Model';

const router = express.Router();

const zodResourceType = z.enum(['image', 'video', 'raw', 'auto']);
const zodBodyMedia = z.object({
    resource_type: zodResourceType.default('auto'),
    user_id: z.string(),
    resource_folder: z.enum(['postulation', 'user', 'department', 'taxonomy', 'university_period', 'resource', 'email']).default('resource'),
});


import { 
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME
} from '../env';
cloud.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
})

const generateRandomNumber = () => Math.floor(Math.random() * 1000);
type ResourceTypes = 'image' | 'video' | 'raw' | 'auto';
const createMedia = async (file: Express.Multer.File, resource_type: ResourceTypes, resource_folder: string) => {
    const parser = new DataUriParser();
    const base64Image = parser.format(path.extname(`${file.originalname}_${generateRandomNumber()}`).toString(), file.buffer);
    if (!base64Image || !base64Image.content) {
        throw new Error(ERRORS.FAILED_TO_GENERATE_BASE64);
    }
    try {
        return await cloud.uploader.upload(base64Image.content, {
            resource_type,
            folder: resource_folder,
        });
    } catch (err) {
        throw new Error(ERRORS.FAILED_UPDATING_MEDIA);
    }
}
const deleteMedia = async (public_id: string) => {
    try {
        return await cloud.uploader.destroy(public_id);
    } catch (err) {
        throw new Error(ERRORS.FAILED_TO_DELETE_MEDIA);
    }
}
router.post('/', multer().any(), async (req: ApiRequest<
    Partial<IResourceDocument> & { file: Express.Multer.File[] }
    >, res: ApiResponse<IResourceDocument>): Promise<void> => {
    const files = req.files;
    if (!files) {
        res.status(400).json({
            message: ERRORS.MEDIA_NOT_FOUND,
            status: 'error'
        });
    }
    const body = zodBodyMedia.parse(req.body);
    if (Array.isArray(files)) {
        await Promise.all(files.map(async (file) => {
            try {
                const resource_type: ResourceTypes = body.resource_type;
                const resource_folder = body.resource_folder;
                const media = await createMedia(file, resource_type, resource_folder);
                if (!media) {
                    throw new Error(ERRORS.MEDIA_NOT_FOUND);
                }
                const resource = await ResourceModel.create({
                    resource_name: ResourceModel.generateResourceName(media.original_filename, body.user_id),
                    resource_owner: body.user_id,
                    resource_type,
                    resource_state: STATE_RESOURCE.AVAILABLE,
                }).catch((err) => {
                    throw new Error(err);
                });
                if (!resource) {
                    throw new Error(ERRORS.FAILED_TO_CREATE_RESOURCE);
                }

                resource.resource_media.push({
                    media_source: media.secure_url,
                    media_public_id: media.public_id,
                    media_signature: media.signature,
                    media_url: media.url
                });

                await resource.save().catch((err) => {
                    throw new Error(err);
                });

                const data = resource.toObject();
                res.status(200).json({
                    status: 'success',
                    data
                })
            } catch (err) {
                res.status(500).json({
                    message: ERRORS.INTERNAL_SERVER_ERROR,
                    status: 'error'
                });
            }
        }));
    } else {
        res.status(400).json({
            message: ERRORS.MEDIA_NOT_FOUND,
            status: 'error'
        });
    }
});

router.get('/:id', async (req: ApiRequest, res: ApiResponse<IResourceDocument>): Promise<void> => {
    const { id } = req.params;
    const resource = await ResourceModel.findById(id).catch((err) => {
        throw new Error(err);
    });
    if (!resource) {
        res.status(404).json({
            message: ERRORS.NOT_FOUND,
            status: 'error'
        });
        return;
    }
    
    const data = resource.toObject();
    res.status(200).json({
        status: 'success',
        data
    });
});
router.put('/:id', async (req: ApiRequest, res: ApiResponse<IResourceDocument>): Promise<void> => {
    const { id } = req.params;
    const resource = await ResourceModel.findById(id).catch((err) => {
        throw new Error(err);
    });
    if (!resource) {
        res.status(404).json({
            message: ERRORS.NOT_FOUND,
            status: 'error'
        });
        return;
    }
    const data = resource.toObject();
    res.status(200).json({
        status: 'success',
        data
    });
});
router.get('/:id/attachments', async (req: ApiRequest<{}, { id: string }>, res: ApiResponse<AttachmentObject[]>): Promise<void> => {
    const { id } = req.params;
    const resource = await ResourceModel.findById(id).catch((err) => {
        throw new Error(err);
    });
    if (!resource) {
        res.status(404).json({
            message: ERRORS.NOT_FOUND,
            status: 'error'
        });
        return;
    }
    const data = resource.resource_attachments;
    res.status(200).json({
        status: 'success',
        data
    });
});



const zAttachmentBody = z.object({
    attachment_reference: z.string(),
    attachment_collection: zModelName,
});

router.post('/:id/attachments', async (req: ApiRequest<{
    attachment_reference: string,
    attachment_collection: string,
}, { id: string }>, res: ApiResponse<IAttachmentDocument>): Promise<void> => {
    const { id: idResource } = req.params;
    const resource = await ResourceModel.findById(idResource).catch((err) => {
        res.status(400).json({
            message: ERRORS.NOT_FOUND,
            status: 'error'
        });
        return;
    });
    if (!resource) {
        res.status(404).json({
            message: ERRORS.NOT_FOUND,
            status: 'error'
        });
        return;
    }
    const attachment = zAttachmentBody.parse(req.body);
    const collection = attachment.attachment_collection; // collection name on mongo
    const reference = new Types.ObjectId(attachment.attachment_reference); // _id reference on the collection
    const modelCollection = mongoose.connection.db.collection(collection);
    const found = await modelCollection.findOne({
        _id: reference,
    }).catch((err) => {
        throw new Error(err);
    });

    if (!found) {
        res.status(404).json({
            message: ERRORS.NOT_FOUND,
            status: 'error'
        });
        return;
    }

    resource.resource_attachments.push({
        attachment_reference: found?._id,
        attachment_collection: collection,
        attachment_state: STATE_ATTACHMENT.ATTACHED,
    });
    await resource.save().catch((err) => {
        throw new Error(err);
    });
    const data = attachment;
    res.status(200).json({
        status: 'success',
        data
    });
});
router.delete('/:id/attachments/:attachment_id', async (req: ApiRequest<{}, { id: string, attachment_id: string }>, res: ApiResponse<AttachmentObject>): Promise<void> => {
    const { id, attachment_id } = req.params;
    const resource = await ResourceModel.findById(id).catch((
        err
    ) => {
        throw new Error(err);
    }
    );
    if (!resource) {
        res.status(404).json({
            message: ERRORS.NOT_FOUND,
            status: 'error'
        });
        return;
    }
    const attachment = resource.resource_attachments.find((attachment) => attachment._id.toString() === attachment_id);
    if (!attachment) {
        res.status(404).json({
            message: ERRORS.NOT_FOUND,
            status: 'error'
        });
        return;
    }
    resource.resource_attachments = resource.resource_attachments.filter((attachment) => attachment._id.toString() !== attachment_id);
    await resource.save().catch((err) => {
        throw new Error(err);
    });
    const data = attachment.toObject();
    res.status(200).json({
        status: 'success',
        data
    });
});
router.delete('/:id', async (req: ApiRequest, res: IApiDeleteResponse): Promise<void> => {
    const { id } = req.params;
    const resource = await ResourceModel.findByIdAndDelete(id).catch((err) => {
        throw new Error(err);
    });
    if (!resource) {
        res.status(404).json({
            message: ERRORS.NOT_FOUND,
            status: 'error'
        });
        return;
    }
    await Promise.all(resource.resource_media.map(async (media) => {
        await deleteMedia(media.media_public_id).catch((err) => {
            throw new Error(err);
        });
    }));
    
    res.status(200).json({
        status: 'success',
        data: {
            deletedCount: 1
        }
    });
});

export default router;