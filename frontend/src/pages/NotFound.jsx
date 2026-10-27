import { Link } from 'react-router-dom';
import { ArrowLeft, Stethoscope } from 'lucide-react';

const NotFound = () => (
  <section className="flex min-h-[60vh] items-center justify-center py-12">
    <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
        <Stethoscope size={30} aria-hidden="true" />
      </div>

      <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-teal-600">
        Error 404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Page not found
      </h1>
      <p className="mx-auto mt-4 max-w-md leading-7 text-slate-600">
        We couldn&apos;t find the page you were looking for. The address may be
        incorrect, or the page may have moved.
      </p>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Back to home
      </Link>
    </div>
  </section>
);

export default NotFound;
