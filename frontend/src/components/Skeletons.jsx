import React from 'react';

// Global Page Load Skeleton
export const PageSkeleton = () => (
  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
    <div className="h-32 bg-slate-200 rounded-3xl w-full"></div>
    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 h-64 flex flex-col justify-between">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-slate-200 rounded-2xl"></div>
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Doctor Card Skeleton for DoctorsList
export const DoctorCardSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="w-16 h-16 bg-slate-200 rounded-2xl"></div>
        <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
      </div>
      <div className="h-6 bg-slate-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-6"></div>
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      </div>
      <div className="h-12 bg-slate-200 rounded-xl w-full"></div>
    </div>
  </div>
);

// Patient Card Skeleton for PatientsList
export const PatientCardSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="w-16 h-16 bg-slate-200 rounded-2xl"></div>
        <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
      </div>
      <div className="h-6 bg-slate-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-6"></div>
      <div className="bg-slate-50 p-4 rounded-xl space-y-4">
        <div className="h-5 bg-slate-200 rounded w-full"></div>
        <div className="h-5 bg-slate-200 rounded w-full"></div>
      </div>
    </div>
  </div>
);

// Appointment Card Skeleton for PatientDashboard
export const AppointmentCardSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse flex flex-col h-full">
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center space-x-4 w-full">
        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
    <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 flex-grow">
      <div className="h-4 bg-slate-200 rounded w-full"></div>
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6 mt-4"></div>
    </div>
    <div className="flex items-center justify-between mt-auto">
      <div className="w-24 h-6 bg-slate-200 rounded-full"></div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
        <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);

// Table Skeleton for DoctorDashboard
export const TableSkeleton = () => (
  <div className="w-full overflow-x-auto animate-pulse">
    <div className="min-w-[700px]">
      <div className="h-10 bg-slate-100 rounded-xl mb-4"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center py-4 border-b border-slate-50 gap-4">
          <div className="flex items-center gap-3 w-1/4">
            <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="w-1/4 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
          </div>
          <div className="w-1/4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
          <div className="w-1/4 flex gap-2">
            <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
            <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
