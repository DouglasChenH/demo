import Immutable from "immutable";
import {
    Patient,
    Admission,
    Transfer,
    DischargeDiagnosis,
    Operations,
    ExternalCauses,
    PathologicalDiagnosis,
    DischargeMethod,
    ComaTime,
    AllergyBloodDeath,
    HospitalRates,
    MedicalPersonnel,
} from './main';
import {
    PatientBasicInfo,
    PastHistory,
    HospitalStayInfo,
    SurgeryRelatedInfo,
    SpecimenLibraryStorage,
    UltrasoundXray,
} from './patient_info';
import {
    NewbornEEG,
    NonNewbornEEG,
} from './EEG';
import {
    VenousPressureRecord,
    BodyTemperatureRecord,
    UrineVolumeRecord,
    VasoactiveDrugsRecord,
    AnalgesicSedativeDrugsRecord,
    AntibioticsRecord,
    RehydrationBloodRecord,
    VentilatorParameters,
    BloodAnalysis,
    InspectionResult,
    MostCareRecord,
    NIRSBeforeOperation,
    NIRSAfterOperation,
    TCDBeforeOperation,
    TCDAfterOperation,
    EatingRecord,
    MonthlyFileUpload,
} from './ICU';
import {
    MRIResult
} from './MRI_exam';
import {
    AuditoryEvokedPotentialResult
} from './auditory_evoked_potential';
import {
    StoolSampleTestingBasicInfo,
    PreOperationAntibioticUsage,
    OperationAntibioticUsage,
    AfterOperationAntibioticUsage,
    SampleTestingInformation,
    SampleTestingResult,
} from './stool_sample_testing';
import {
    GeneralTable,
    AppointmentTable,
    AssessmentTable,
} from './neurodevelopmental_assessment';
import {
    EconomyCondition,
    ScreenUsage,
} from './questionnaire';
import { 
    ReviewTracking,
    ReviewResult,
} from './neurology_review_tracking';

// some fields includes '日期','时间', but is a number or text
export const SPECIAL_MOMENT_FIELDS_NOT_TIME_FORMATS = {
    "住院时间": 'number',
    "ICU停留时间": 'number',
    "术前机械通气时间（h）": 'number',
    "术后机械通气时间（h）": 'number',
    "麻醉时间（h）": 'number',
    "手术时间（h)": 'number',
    "持续时间（秒）": 'number',
    "间隔时间（秒）": 'number',
    "抑制所用时间（秒）": 'number',
    "非周末使用时间（小时）": 'number',
    "周末使用时间（小时）": 'number',
    "每日使用时间（小时）": 'number',
    "ICU时间点": 'number',
    "检查日期备注": 'text',
    "检查时间备注": 'text',
};

// default time format for filters is 'yyyy-mm-dd HH:mm'
// list time fields which uses 'HH:mm:ss' format here as special cases
export const SPECIAL_TIME_FIELDS_WITH_FORMATS = [
    "术前呼吸机插管时间",
    "术前呼吸机拔管时间",
    "术后呼吸机插管时间",
    "术后呼吸机拔管时间",
    "麻醉开始时间",
    "麻醉结束时间",
    "手术开始时间",
    "手术结束时间",
    "时间点",
    "开始时间",
    "记录时间",
];

export const SPECIAL_FILE_FIELDS = [
    "MRI报告",
    "MRI原始文件",
    "手术总名单",
    "组织标本库入库名单",
    "血液标本库入库名单",
    "mostcare 原始数据",
    "INVOS 原始数据",
];

export const FORM_GROUP_MAP = {
    main: '首页',
    patient_info: '患者基本信息',
    EEG: '脑电图',
    ICU: '监护室临床数据、血流动力学、NIRS和TCD',
    auditory_evoked_potential: "听诱发电位",
    MRI: "MRI检查",
    stool_sample_testing: "粪便样本化验",
    neurodevelopmental_assessment: "神经发育评估",
    questionnaire: "问卷",
    neurology_review_tracking: "神经科复查追踪",
}

export const FORM_NAME_MAP = {
    patient_info: {
        patient_info: {
            name: "患者基本信息",
            component: PatientBasicInfo,
        },
        past_history: {
            name: "既往史",
            component: PastHistory,
        }, 
        hospital_stay_info: {
            name: "医内停留信息",
            component: HospitalStayInfo,
        },
        surgery_related_info: {
            name: "手术相关信息 ",
            component: SurgeryRelatedInfo,
        },
        specimen_library_storage: {
            name: "标本库入库 ",
            component: SpecimenLibraryStorage,
        },
        ultrasound_Xray: {
            name: "围术期超声和X光检查 ",
            component: UltrasoundXray,
        } 
    },
    main: {
        basic_info: {
            name: "基本信息",
            component: Patient,
        },  
        admission:  {
            name: "入院信息",
            component: Admission,
        },
        transfer: {
            name: "转科",
            component: Transfer,
        },
        discharge_diagnosis: {
            name: "出院诊断",
            component: DischargeDiagnosis,
        },
        operations: {
            name: "手术及操作",
            component: Operations,
        },
        external_causes: {
            name: "损伤、中毒等外部原因",
            component: ExternalCauses,
        },
        pathological_diagnosis: {
            name: "病理诊断",
            component: PathologicalDiagnosis,
        },
        discharge_method: {
            name: "离院方式",
            component: DischargeMethod,
        },
        coma_time: {
            name: "颅脑损伤昏迷时间",
            component: ComaTime,
        },
        allergy_blood_death: {
            name: "药敏/血型/死亡",
            component: AllergyBloodDeath,
        },
        hospital_rates: {
            name: "住院费用",
            component: HospitalRates,
        },
        medical_personnel: {
            name: "医护/病案",
            component: MedicalPersonnel,
        },
    },
    EEG: {
        newborn_EEG: {
            name: "新生儿脑电图检查基本信息",
            component: NewbornEEG,
        },
        non_newborn_EEG: {
            name: "非新生儿脑电图检查基本信息",
            component: NonNewbornEEG,
        },
    },
    ICU: {
        venous_pressure_record: {
            name: "术后48小时连续中心静脉压记录",
            component: VenousPressureRecord,
        },
        body_temperature_record: {
            name: "术后48小时连续体温记录",
            component: BodyTemperatureRecord,
        },
        urine_volume_record: {
            name: "术后48小时连续尿量记录",
            component: UrineVolumeRecord,
        },
        vasoactive_drugs_record: {
            name: "术后48小时连续血管活性药记录",
            component: VasoactiveDrugsRecord,
        },
        analgesic_sedative_drug_records: {
            name: "术后48小时连续镇痛镇静药记录",
            component: AnalgesicSedativeDrugsRecord,
        },
        antibiotics_record: {
            name: "术后48小时连续抗生素使用",
            component: AntibioticsRecord,
        },
        rehydration_blood_record: {
            name: "术后48小时连续镇监测补液、输血扩容",
            component: RehydrationBloodRecord,
        },
        ventilator_parameters: {
            name: "术后48小时连续监测呼吸机参数",
            component: VentilatorParameters,
        },
        blood_analysis: {
            name: "术后48小时连续监测血气分析",
            component: BloodAnalysis,
        },
        inspection_result: {
            name: "术后48小时连续监测检验指标",
            component: InspectionResult,
        },
        most_care_record: {
            name: "术后48小时连续Most Care记录",
            component: MostCareRecord,
        },
        NIRS_before_operation: {
            name: "术前NIRS",
            component: NIRSBeforeOperation,
        },
        NIRS_after_operation: {
            name: "术后48小时NIRS",
            component: NIRSAfterOperation,
        },
        TCD_before_operation: {
            name: "术前TCD",
            component: TCDBeforeOperation,
        },
        TCD_after_operation: {
            name: "术后48小时TCD",
            component: TCDAfterOperation,
        },
        eating_record: {
            name: "术后连续监测进食",
            component: EatingRecord,
        },
        monthly_file_upload: {
            name: "文件上传（按月上传）",
            component: MonthlyFileUpload,
            filter: false
        }, 
    },
    MRI: {
        MRI_result: {
            name: "检查结果",
            component: MRIResult,
        },
    },
    auditory_evoked_potential: {
        auditory_evoked_potential_result: {
            name: "检查结果",
            component: AuditoryEvokedPotentialResult,
        },
    },
    stool_sample_testing: {
        stool_sample_testing_basic_info: {
            name: "基本信息",
            component: StoolSampleTestingBasicInfo,
        },
        pre_operatiion_antibiotic_usage: {
            name: "术前抗生素使用",
            component: PreOperationAntibioticUsage,
        },
        operation_antibiotic_usage: {
            name: "术中抗生素使用",
            component: OperationAntibioticUsage,
        },
        after_operation_antibiotic_usage: {
            name: "术后抗生素使用",
            component: AfterOperationAntibioticUsage,
        },
        sample_testing_information: {
            name: "取样信息",
            component: SampleTestingInformation,
        },
        sample_testing_result: {
            name: "送检结果",
            component: SampleTestingResult,
            filter: false
        },
    },
    neurodevelopmental_assessment: {
        general_table: {
            name: "一般表格",
            component: GeneralTable,
        },
        appointment_table: {
            name: "预约表格",
            component: AppointmentTable,
        },
        assessment_table: {
            name: "评估表格",
            component: AssessmentTable,
        },
    },
    questionnaire: {
        economy_condition: {
            name: "社会经济状况",
            component: EconomyCondition,
        },
        screen_usage: {
            name: "电子屏幕使用时间",
            component: ScreenUsage,
        }
    },
    neurology_review_tracking: {
        review_tracking: {
            name: "复查基本信息（对接神经科）",
            component: ReviewTracking,
        },
        review_result: {
            name: "复查结果（对接神经科）",
            component: ReviewResult,
        }
    }
};


function flattenFormNameMaps(formNameMap) {
    let formNameTranslator = {};

    Object.keys(formNameMap).forEach(key => 
        Object.keys(formNameMap[key]).forEach(subKey =>
            formNameTranslator[subKey] = formNameMap[key][subKey].name
        )
    );

    return formNameTranslator;
}

export const FORM_NAME_TRANSLATOR = flattenFormNameMaps(FORM_NAME_MAP);