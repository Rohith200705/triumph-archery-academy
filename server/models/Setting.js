import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'form', unique: true },
    academyName: { type: String, default: 'Triumph Archery Academy' },
    motto: { type: String, default: 'Aim · Focus · Triumph' },
    formTitle: { type: String, default: 'Admission Form' },
    footer: {
      type: String,
      default:
        'CONTACT US · Phone: 9600019334 & 9094070501 · Location: Parvathi Nagar, Old Perungalathur'
    },
    declarationText: {
      type: String,
      default:
        'I hereby declare that the information provided above is true and accurate to the best of my knowledge. I agree to follow the Academy rules, safety protocols, and all policies of Triumph Archery Academy.'
    }
  },
  { timestamps: true }
);

settingSchema.statics.getForm = async function () {
  let doc = await this.findOne({ key: 'form' });
  if (!doc) doc = await this.create({ key: 'form' });
  return doc;
};

export default mongoose.model('Setting', settingSchema);
