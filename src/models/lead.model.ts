import { Schema, model, type Model, type HydratedDocument } from 'mongoose';

export type LeadStatus =
  | 'Active'
  | 'Blocked'
  | 'Purchased'
  | 'Returned'
  | 'Missed'
  | 'Ignored'
  | 'NoAnswer'
  | 'FollowUp'
  | 'Considering'
  | 'WillVisitStore'
  | 'WillSendPassport'
  | 'Scoring'
  | 'ScoringResult'
  | 'VisitedStore'
  | 'NoPurchase'
  | 'Closed';

export interface ILeadPbx {
  last_uuid?: string;
  last_event?: string;
  last_direction?: string; // inbound/outbound
  last_date?: Date;
  last_operator_ext?: string;
  last_download_url?: string;
  last_answered_uuid?: string;
  prev_status?: string | null;
}

export interface ILead {
  n?: string;
  uniqueId?: string;

  pbx?: ILeadPbx;

  answered?: boolean;
  answeredAt?: Date | null;

  limit?: number;
  paymentScore?: string;
  totalContracts?: string;
  openContracts?: string;
  totalAmount?: string;
  totalPaid?: string;
  overdueDebt?: string;
  maxDelay?: string;
  avgPaymentDelay?: string;

  clientName?: string;
  clientPhone?: string;
  clientPhone2?: string;

  cardCode?: string;
  cardName?: string;

  source?: string;
  leadTime?: string;

  time?: Date;
  recallDate?: Date;
  recallBumpedAt?: Date | null;

  newTime?: Date;

  operator?: string;
  called?: boolean;
  callTime?: Date;

  callCount?: number;
  noAnswerCount?: number;

  interested?: boolean;
  rejectionReason?: string;

  passportVisit?: string;
  jshshir?: string;
  idX?: string;

  operator2?: string;
  called2?: boolean;
  answered2?: boolean;
  callCount2?: number;

  meetingDate?: Date;
  rejectionReason2?: string;

  paymentInterest?: string;
  branch?: string;

  meetingHappened?: boolean;
  percentage?: number;

  meetingConfirmed?: boolean;
  isBlocked?: boolean;
  meetingConfirmedDate?: Date;

  consultant?: string;
  purchase?: boolean;
  purchaseDate?: Date;

  saleType?: string;

  passportId?: string;
  jshshir2?: string;

  clientFullName?: string;
  source2?: string;

  seller?: string; // siz reportda shuni filter qilyapsiz

  region?: string;
  district?: string;
  neighborhood?: string;
  street?: string;
  house?: string;

  address?: string;
  address2?: string;

  branch2?: string;

  birthDate?: Date;
  applicationDate?: Date;

  scoring?: string;
  age?: number;
  score?: number;

  katm?: string;
  katmPayment?: number;

  paymentHistory?: string;
  acceptedReason?: string;
  comment?: string;

  mib?: number;
  mibIrresponsible?: number;
  aliment?: number;

  officialSalary?: number;

  finalLimit?: number;
  finalPercentage?: number;

  limitDate?: Date | null;

  seen?: boolean | null;

  talkedFlag?: boolean;
  talkedAt?: Date | null;

  consideringBumped?: boolean;
  consideringBumpedAt?: Date | null;
  consideringBumpedReason?: string | null;

  bumpNotifiedAt?: Date | null;
  bumpEscalatedAt?: Date | null;

  status: LeadStatus;

  invoiceCreated?: boolean;
  invoiceDocEntry?: string | null;
  invoiceDocNum?: string | null;
  invoiceCreatedAt?: Date | null;

  statusChangedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export type LeadDocument = HydratedDocument<ILead>;

const LeadSchema = new Schema<ILead>(
  {
    n: { type: String },

    uniqueId: { type: String, default: undefined },

    pbx: {
      last_uuid: String,
      last_event: String,
      last_direction: String,
      last_date: Date,
      last_operator_ext: String,
      last_download_url: String,
      last_answered_uuid: String,
      prev_status: { type: String, default: null },
    },

    answered: { type: Boolean, default: false },
    answeredAt: { type: Date, default: null },

    limit: Number,
    paymentScore: String,
    totalContracts: String,
    openContracts: String,
    totalAmount: String,
    totalPaid: String,
    overdueDebt: String,
    maxDelay: String,
    avgPaymentDelay: String,

    clientName: { type: String, trim: true },
    clientPhone: { type: String, trim: true },
    clientPhone2: { type: String, trim: true },

    cardCode: { type: String, trim: true },
    cardName: { type: String, trim: true },

    source: String,
    leadTime: String,

    time: Date,
    recallDate: Date,
    recallBumpedAt: { type: Date, default: null, index: true },

    newTime: { type: Date, index: true },

    operator: String,
    called: Boolean,
    callTime: Date,

    callCount: { type: Number, default: 0 },
    noAnswerCount: { type: Number, default: 0 },

    interested: Boolean,
    rejectionReason: String,

    passportVisit: String,
    jshshir: String,
    idX: String,

    operator2: String,
    called2: Boolean,
    answered2: Boolean,
    callCount2: Number,

    meetingDate: Date,
    rejectionReason2: String,

    paymentInterest: String,
    branch: String,

    meetingHappened: Boolean,
    percentage: Number,

    meetingConfirmed: Boolean,
    isBlocked: Boolean,
    meetingConfirmedDate: Date,

    consultant: String,
    purchase: Boolean,
    purchaseDate: Date,

    saleType: String,

    passportId: String,
    jshshir2: String,

    clientFullName: String,
    source2: String,

    seller: String,

    region: String,
    district: String,
    neighborhood: { type: String, trim: true },
    street: { type: String, trim: true },
    house: { type: String, trim: true },

    address: String,
    address2: String,

    branch2: String,

    birthDate: Date,
    applicationDate: Date,

    scoring: String,
    age: Number,
    score: Number,

    katm: String,
    katmPayment: Number,

    paymentHistory: String,
    acceptedReason: String,
    comment: String,

    mib: Number,
    mibIrresponsible: Number,
    aliment: Number,

    officialSalary: Number,

    finalLimit: Number,
    finalPercentage: Number,

    limitDate: { type: Date, default: null },

    seen: { type: Boolean, default: null },

    talkedFlag: { type: Boolean, default: false, index: true },
    talkedAt: { type: Date, default: null, index: true },

    consideringBumped: { type: Boolean, default: false, index: true },
    consideringBumpedAt: { type: Date, default: null },
    consideringBumpedReason: { type: String, default: null },

    bumpNotifiedAt: { type: Date, default: null, index: true },
    bumpEscalatedAt: { type: Date, default: null, index: true },

    status: {
      type: String,
      enum: [
        'Active',
        'Blocked',
        'Purchased',
        'Returned',
        'Missed',
        'Ignored',
        'NoAnswer',
        'FollowUp',
        'Considering',
        'WillVisitStore',
        'WillSendPassport',
        'Scoring',
        'ScoringResult',
        'VisitedStore',
        'NoPurchase',
        'Closed',
      ],
      default: 'Active',
      required: true,
    },

    invoiceCreated: { type: Boolean, default: false },
    invoiceDocEntry: { type: String, default: null },
    invoiceDocNum: { type: String, default: null },
    invoiceCreatedAt: { type: Date, default: null },

    statusChangedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

// uniqueId partial unique index (faqat string bo'lsa)
LeadSchema.index(
  { uniqueId: 1 },
  {
    unique: true,
    partialFilterExpression: { uniqueId: { $type: 'string' } },
  },
);

LeadSchema.index({ status: 1, consideringBumped: 1, consideringBumpedAt: 1, bumpNotifiedAt: 1 });
LeadSchema.index({ status: 1, consideringBumped: 1, bumpNotifiedAt: 1, bumpEscalatedAt: 1 });

export const Lead: Model<ILead> = model<ILead>('Leads', LeadSchema); // ✅ shu joy muhim
export { LeadSchema };
