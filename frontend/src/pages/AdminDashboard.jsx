import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BadgeCheck, Building2, CalendarDays, Check, Clock3, RefreshCw, Stethoscope, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const PAGE_SIZE = 12;
const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

const emptyCounts = { all: 0, pending: 0, approved: 0, rejected: 0 };

const DoctorCardSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm" aria-hidden="true">
    <div className="flex items-center gap-4">
      <div className="h-14 w-14 rounded-2xl bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/5 rounded bg-slate-200" />
        <div className="h-3 w-1/4 rounded bg-slate-100" />
      </div>
      <div className="h-6 w-20 rounded-full bg-slate-100" />
    </div>
    <div className="mt-7 grid grid-cols-2 gap-5">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="space-y-2">
          <div className="h-3 w-2/3 rounded bg-slate-100" />
          <div className="h-4 w-4/5 rounded bg-slate-200" />
        </div>
      ))}
    </div>
    <div className="mt-6 h-20 rounded-2xl bg-slate-100" />
    <div className="mt-6 h-11 rounded-xl bg-slate-100" />
  </div>
);

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200'
};

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [counts, setCounts] = useState(emptyCounts);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const sentinelRef = useRef(null);
  const requestIdRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    const requestId = ++requestIdRef.current;

    api.get('/admin/doctors', { params: { status: filter, page: 1, limit: PAGE_SIZE } })
      .then(({ data }) => {
        if (!active) return;
        setDoctors(data.data);
        setCounts(data.pagination.counts);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      })
      .catch((error) => {
        if (active) {
          setLoadingError(true);
          toast.error(error.response?.data?.message || 'Failed to load doctor applications');
        }
      })
      .finally(() => {
        if (active && requestId === requestIdRef.current) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [filter, refreshKey]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || page >= totalPages || loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    const requestId = requestIdRef.current;
    try {
      const { data } = await api.get('/admin/doctors', {
        params: { status: filter, page: page + 1, limit: PAGE_SIZE }
      });
      if (requestId === requestIdRef.current) {
        setDoctors((current) => [...current, ...data.data]);
        setCounts(data.pagination.counts);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        toast.error(error.response?.data?.message || 'Failed to load more doctor applications');
      }
    } finally {
      loadingMoreRef.current = false;
      if (requestId === requestIdRef.current) setLoadingMore(false);
    }
  }, [filter, loading, loadingMore, page, totalPages]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || loading || page >= totalPages || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: '240px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, loading, page, totalPages]);

  const reviewApplication = async (doctor, decision) => {
    if (decision === 'reject' && !window.confirm(`Reject ${doctor.name}'s application?`)) {
      return;
    }

    setUpdatingId(doctor._id);
    try {
      const { data } = await api.patch(`/admin/doctors/${doctor._id}/review`, { decision });
      toast.success(data.message);
      setRefreshKey((current) => current + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to review application');
    } finally {
      setUpdatingId(null);
    }
  };

  const selectFilter = (status) => {
    if (status === filter) return;
    setLoading(true);
    setLoadingError(false);
    setLoadingMore(false);
    loadingMoreRef.current = false;
    setFilter(status);
    document.getElementById('doctor-application-list')?.scrollIntoView({
      behavior: reduceMotion ? 'instant' : 'smooth',
      block: 'start'
    });
  };

  const refreshApplications = () => {
    setLoading(true);
    setLoadingError(false);
    setLoadingMore(false);
    loadingMoreRef.current = false;
    setRefreshKey((current) => current + 1);
  };

  const emptyTitle = filter === 'all' ? 'No doctor applications yet' : `No ${filter} applications`;
  const emptyDescription = filter === 'pending'
    ? 'New doctor applications will appear here for review.'
    : 'Try another status filter to see doctor applications.';

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
          onClick={refreshApplications}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition duration-200 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          Refresh
        </button>
      </header>

      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Filter doctor applications">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            id={`doctor-filter-${value}`}
            type="button"
            role="tab"
            aria-selected={filter === value}
            aria-controls="doctor-application-list"
            onClick={() => selectFilter(value)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
              filter === value
                ? 'border-teal-700 bg-teal-700 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700'
            }`}
          >
            {label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              filter === value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {counts[value]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 text-sm text-slate-600" aria-live="polite">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Clock3 size={19} aria-hidden="true" />
        </span>
        <span>
          Showing <strong className="text-slate-900">{counts[filter]}</strong> {filter === 'all' ? 'doctor application' : `${filter} application`}
          {counts[filter] === 1 ? '' : 's'}
        </span>
      </div>

      <div id="doctor-application-list" role="tabpanel" aria-labelledby={`doctor-filter-${filter}`} className="scroll-mt-6">
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2" aria-label="Loading doctor applications">
            {[0, 1, 2, 3].map((item) => <DoctorCardSkeleton key={item} />)}
          </div>
        ) : loadingError ? (
          <div className="rounded-3xl border border-rose-200 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-bold text-slate-900">Could not load applications</h2>
            <p className="mt-2 text-slate-500">Check your connection and try again.</p>
            <button
              type="button"
              onClick={refreshApplications}
              className="mt-5 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800"
            >
              Try again
            </button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <BadgeCheck size={28} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-900">{emptyTitle}</h2>
            <p className="mt-2 text-slate-500">{emptyDescription}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              {doctors.map((doctor, index) => {
                const status = doctor.doctorVerificationStatus || 'pending';
                const isUpdating = updatingId === doctor._id;
                return (
                  <motion.article
                    key={doctor._id}
                    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={reduceMotion ? undefined : { y: -4 }}
                    transition={{ duration: 0.22, delay: reduceMotion ? 0 : Math.min(index % PAGE_SIZE, 5) * 0.035 }}
                    className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-shadow duration-200 hover:border-teal-100 hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
                      <div className="flex items-center gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 transition-colors duration-200 group-hover:bg-teal-100">
                          <Stethoscope size={25} aria-hidden="true" />
                        </span>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900">{doctor.name}</h2>
                          <p className="text-sm text-slate-500">@{doctor.username}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyles[status] || statusStyles.pending}`}>
                        {status}
                      </span>
                    </div>

                    <div className="space-y-5 p-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Specialization</p>
                          <p className="mt-1 font-medium text-slate-800">{doctor.specialization || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Qualification</p>
                          <p className="mt-1 font-medium text-slate-800">{doctor.qualification || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Experience</p>
                          <p className="mt-1 font-medium text-slate-800">{doctor.experience ?? 'Not provided'}{doctor.experience != null ? ' years' : ''}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Consultation fee</p>
                          <p className="mt-1 font-medium text-slate-800">{doctor.consultationFee != null ? `₹${doctor.consultationFee}` : 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        <p>{doctor.email} · {doctor.phone}</p>
                        <p className="flex items-center gap-2"><Building2 size={16} aria-hidden="true" />{doctor.hospital || 'Hospital not provided'}</p>
                        <p className="flex items-center gap-2"><CalendarDays size={16} aria-hidden="true" />{doctor.availableDays?.join(', ') || 'Availability not provided'}{doctor.availableFrom && doctor.availableTo ? ` · ${doctor.availableFrom}–${doctor.availableTo}` : ''}</p>
                      </div>

                      {doctor.bio && <p className="text-sm leading-6 text-slate-600">{doctor.bio}</p>}
                      <p className="text-xs text-slate-400">
                        Submitted {new Date(doctor.createdAt).toLocaleDateString()}
                      </p>

                      {status === 'pending' && (
                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => reviewApplication(doctor, 'approve')}
                            disabled={updatingId !== null}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white transition duration-200 hover:bg-teal-700 hover:shadow-md disabled:cursor-not-allowed"
                          >
                            <Check size={18} aria-hidden="true" />
                            {isUpdating ? 'Saving…' : 'Approve doctor'}
                          </button>
                          <button
                            type="button"
                            onClick={() => reviewApplication(doctor, 'reject')}
                            disabled={updatingId !== null}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 font-semibold text-rose-700 transition duration-200 hover:bg-rose-50 hover:shadow-sm disabled:cursor-not-allowed"
                          >
                            <X size={18} aria-hidden="true" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
            {page < totalPages && (
              <div ref={sentinelRef} className="flex justify-center py-8">
                {loadingMore ? (
                  <div className="grid w-full gap-6 lg:grid-cols-2" aria-label="Loading more applications">
                    {[0, 1].map((item) => <DoctorCardSkeleton key={item} />)}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={loadMore}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                  >
                    Load more applications
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default AdminDashboard;
