import React, { useState } from 'react';
import {Edit2,Trash2,Calendar,User,FileText,AlertTriangle,Pill,Heart,Users} from 'lucide-react';

// Types
interface MedicalCondition {
  id: string;
  condition: string;
  diagnosedDate: string;
  status: 'Active' | 'Resolved' | 'Chronic';
  notes?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedDate: string;
  prescribedBy: string;
  status: 'Active' | 'Discontinued';
}

interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  discoveredDate: string;
}

interface Surgery {
  id: string;
  procedure: string;
  date: string;
  hospital: string;
  surgeon: string;
  notes?: string;
}

interface FamilyHistory {
  id: string;
  relation: string;
  condition: string;
  ageAtDiagnosis?: string;
  notes?: string;
}

interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  bloodType: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
}

export const MedicalHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('conditions');

  const patient: Patient = {
    id: 'P001',
    name: 'Sarah Johnson',
    dateOfBirth: '1985-03-15',
    bloodType: 'A+',
    emergencyContact: {
      name: 'Michael Johnson',
      phone: '+1 (555) 123-4567',
      relation: 'Spouse'
    }
  };

  const conditions: MedicalCondition[] = [
    {
      id: '1',
      condition: 'Hypertension',
      diagnosedDate: '2020-05-15',
      status: 'Active',
      notes: 'Controlled with medication'
    },
    {
      id: '2',
      condition: 'Type 2 Diabetes',
      diagnosedDate: '2019-11-22',
      status: 'Active',
      notes: 'HbA1c 7.2% at last check'
    }
  ];

  const medications: Medication[] = [
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      prescribedDate: '2020-05-15',
      prescribedBy: 'Dr. Smith',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      prescribedDate: '2019-11-22',
      prescribedBy: 'Dr. Wilson',
      status: 'Active'
    }
  ];

  const allergies: Allergy[] = [
    {
      id: '1',
      allergen: 'Penicillin',
      reaction: 'Rash, difficulty breathing',
      severity: 'Severe',
      discoveredDate: '1995-07-10'
    }
  ];

  const surgeries: Surgery[] = [
    {
      id: '1',
      procedure: 'Appendectomy',
      date: '2010-03-22',
      hospital: 'General Hospital',
      surgeon: 'Dr. Brown',
      notes: 'Uncomplicated laparoscopic procedure'
    }
  ];

  const familyHistory: FamilyHistory[] = [
    {
      id: '1',
      relation: 'Mother',
      condition: 'Breast Cancer',
      ageAtDiagnosis: '55',
      notes: 'Successfully treated, in remission'
    },
    {
      id: '2',
      relation: 'Father',
      condition: 'Heart Disease',
      ageAtDiagnosis: '62'
    }
  ];

  const calculateAge = (dob: string): number => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Resolved':
        return 'bg-blue-100 text-blue-800';
      case 'Chronic':
        return 'bg-yellow-100 text-yellow-800';
      case 'Discontinued':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'Mild':
        return 'bg-yellow-100 text-yellow-800';
      case 'Moderate':
        return 'bg-orange-100 text-orange-800';
      case 'Severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'conditions', label: 'Medical Conditions', icon: Heart },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'allergies', label: 'Allergies', icon: AlertTriangle },
    { id: 'surgeries', label: 'Surgeries', icon: FileText },
    { id: 'family', label: 'Family History', icon: Users }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-gray-600">Patient ID: {patient.id}</p>
              <p className="text-gray-600">Age: {calculateAge(patient.dateOfBirth)} years</p>
            </div>
          </div>
          <div className="text-right grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Date of Birth</p>
              <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
            </div>
            <div>
              <p className="text-gray-500">Blood Type</p>
              <p className="font-medium">{patient.bloodType}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500">Emergency Contact</p>
              <p className="font-medium">{patient.emergencyContact.name}</p>
              <p className="text-gray-600">{patient.emergencyContact.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6 border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        {/* Dynamic Sections */}
        {activeTab === 'conditions' &&
          conditions.map(({ id, condition, diagnosedDate, status, notes }) => (
            <div key={id} className="border border-gray-200 rounded-lg p-4 flex justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{condition}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Diagnosed: {formatDate(diagnosedDate)}
                </p>
                {notes && <p className="text-sm text-gray-600 mt-1">Notes: {notes}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                  {status}
                </span>
                <Edit2 className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600 cursor-pointer" />
              </div>
            </div>
          ))}

        {activeTab === 'medications' &&
          medications.map(({ id, name, dosage, frequency, prescribedDate, prescribedBy, status }) => (
            <div key={id} className="border border-gray-200 rounded-lg p-4 flex justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Dosage: {dosage} - {frequency}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Prescribed by: {prescribedBy} on {formatDate(prescribedDate)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                  {status}
                </span>
                <Edit2 className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600 cursor-pointer" />
              </div>
            </div>
          ))}

        {activeTab === 'allergies' &&
          allergies.map(({ id, allergen, reaction, severity, discoveredDate }) => (
            <div key={id} className="border border-gray-200 rounded-lg p-4 flex justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{allergen}</h3>
                <p className="text-sm text-gray-600 mt-1">Reaction: {reaction}</p>
                <p className="text-sm text-gray-600 mt-1">Discovered: {formatDate(discoveredDate)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(severity)}`}>
                  {severity}
                </span>
                <Edit2 className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600 cursor-pointer" />
              </div>
            </div>
          ))}

        {activeTab === 'surgeries' &&
          surgeries.map(({ id, procedure, date, hospital, surgeon, notes }) => (
            <div key={id} className="border border-gray-200 rounded-lg p-4 flex justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{procedure}</h3>
                <p className="text-sm text-gray-600 mt-1">Date: {formatDate(date)}</p>
                <p className="text-sm text-gray-600 mt-1">Hospital: {hospital}</p>
                <p className="text-sm text-gray-600 mt-1">Surgeon: {surgeon}</p>
                {notes && <p className="text-sm text-gray-600 mt-1">Notes: {notes}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600 cursor-pointer" />
              </div>
            </div>
          ))}

        {activeTab === 'family' &&
          familyHistory.map(({ id, relation, condition, ageAtDiagnosis, notes }) => (
            <div key={id} className="border border-gray-200 rounded-lg p-4 flex justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{relation} - {condition}</h3>
                {ageAtDiagnosis && (
                  <p className="text-sm text-gray-600 mt-1">Age at diagnosis: {ageAtDiagnosis}</p>
                )}
                {notes && (
                  <p className="text-sm text-gray-600 mt-1">Notes: {notes}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600 cursor-pointer" />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
