import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Building2, CalendarDays, Check, Clock3, RefreshCw, Stethoscope, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadApplications = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/doctors/pending');
      setDoctors(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load doctor applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    api.get('/admin/doctors/pending')
      .then(({ data }) => {
        if (active) {
          setDoctors(data.data);
        }
      })
      .catch((error) => {
        if (active) {
          toast.error(error.response?.data?.message || 'Failed to load doctor applications');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const reviewApplication = async (doctor, decision) => {
    const action = decision === 'approve' ? 'approve' : 'reject';
    if (action === 'reject' && !window.confirm(`Reject ${doctor.name}'s application?`)) {
      return;
    }

    setUpdatingId(doctor._id);
    try {
      const { data } = await api.patch(`/admin/doctors/${doctor._id}/review`, { decision });
      setDoctors((currentDoctors) => currentDoctors.filter((current) => current._id !== doctor._id));
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to review application');
      await loadApplications();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-8 pb-24">
      <header className="flex flex-col gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-700">
            <BadgeCheck size={15} aria-hidden="true" />
            Admin portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Doctor applications</h1>
          <p className="mt-2 text-slate-500">Review clinician details before granting access to the platform.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            loadApplications();
          }}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          Refresh
        </button>
      </header>

      <div className="flex items-center gap-3 text-sm text-slate-600">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Clock3 size={19} aria-hidden="true" />
        </span>
        <span><strong className="text-slate-900">{doctors.length}</strong> application{doctors.length === 1 ? '' : 's'} awaiting review</span>
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[0, 1].map((item) => <div key={item} className="h-72 animate-pulse rounded-3xl bg-slate-200" />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <BadgeCheck size={28} aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-slate-900">You&apos;re all caught up</h2>
          <p className="mt-2 text-slate-500">New doctor applications will appear here for review.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {doctors.map((doctor) => (
            <article key={doctor._id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <Stethoscope size={25} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{doctor.name}</h2>
                    <p className="text-sm text-slate-500">@{doctor.username}</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>
              </div>

              <div className="space-y-5 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Specialization</p>
                    <p className="mt-1 font-medium text-slate-800">{doctor.specialization}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Qualification</p>
                    <p className="mt-1 font-medium text-slate-800">{doctor.qualification}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Experience</p>
                    <p className="mt-1 font-medium text-slate-800">{doctor.experience} years</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Consultation fee</p>
                    <p className="mt-1 font-medium text-slate-800">₹{doctor.consultationFee}</p>
                  </div>
                </div>

                <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p>{doctor.email} · {doctor.phone}</p>
                  <p className="flex items-center gap-2"><Building2 size={16} aria-hidden="true" />{doctor.hospital}</p>
                  <p className="flex items-center gap-2"><CalendarDays size={16} aria-hidden="true" />{doctor.availableDays?.join(', ')} · {doctor.availableFrom}–{doctor.availableTo}</p>
                </div>

                {doctor.bio && <p className="text-sm leading-6 text-slate-600">{doctor.bio}</p>}
                <p className="text-xs text-slate-400">
                  Submitted {new Date(doctor.createdAt).toLocaleDateString()}
                </p>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => reviewApplication(doctor, 'approve')}
                    disabled={updatingId !== null}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Check size={18} aria-hidden="true" />
                    {updatingId === doctor._id ? 'Saving…' : 'Approve doctor'}
                  </button>
                  <button
                    type="button"
                    onClick={() => reviewApplication(doctor, 'reject')}
                    disabled={updatingId !== null}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X size={18} aria-hidden="true" />
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
