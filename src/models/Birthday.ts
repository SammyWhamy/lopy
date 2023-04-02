import { Document, model, Schema } from "mongoose";

export interface Birthday extends Document {
    user: string,
    date: Date
}

const schema: Schema<Birthday> = new Schema({
    user: {
        type: String,
        required: true,
        validate: {
            validator: /^\d{16,20}$/.test,
            message: (props: { value: any; }) => `${props.value} is not a valid ID`,
        },
    },
    date: {
        type: Date,
        required: true,
    },
});

schema.index({ user: 1 }, { unique: true });

export const BirthdayModel = model("Birthday", schema);
