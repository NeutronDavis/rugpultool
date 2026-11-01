import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Clock,
  Megaphone,
  MessageSquareQuote,
  Quote,
  Sparkles,
  Star,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Reviews — rugpulltool",
  description:
    "What users say about the rugpulltool risk radar, Launch Studio and Solana Pay plans.",
};

export const dynamic = "force-dynamic";

const PLAN_LABEL: Record<string, string> = {
  FREE: "Free",
  TESTER: "Tester",
  BASIC: "Basic",
  ADVANCED: "Advanced",
  PREMIUM: "Premium",
};

type ReviewRow = {
  id: string;
  authorName: string;
  handle: string | null;
  plan: string | null;
  rating: number;
  title: string | null;
  body: string;
  featured: boolean;
  createdAt: Date;
};

export default async function ReviewsPage() {
  let reviews: ReviewRow[] = [];
  let loadFailed = false;

  try {
    reviews = await prisma.review.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        authorName: true,
        handle: true,
        plan: true,
        rating: true,
        title: true,
        body: true,
        featured: true,
        createdAt: true,
      },
    });
  } catch (err) {
    console.error("[reviews] could not load reviews:", (err as Error).message);
    loadFailed = true;
  }

  const count = reviews.length;
  const average =
    count > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0;
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    total: reviews.filter((review) => review.rating === rating).length,
  }));

  return (
    <div className="mx-auto max-w-6xl py-2 sm:py-4">
      {/* Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <MessageSquareQuote className="h-3.5 w-3.5" />
          <span>Community reviews</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-base-content sm:text-4xl">
          What users say about rugpulltool
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-base-content/60 sm:text-base">
          Honest notes from people using the radar, Launch Studio and Positions. Reviews are
          individual experiences, not financial advice.
        </p>
      </div>

      {/* Reopening notice */}
      <div className="mt-6 rounded-xl border border-info/30 bg-info/10 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-info/15 text-info">
              <Megaphone className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-base-content/85">
                Reviews are opening back up soon
              </p>
              <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-base-content/60">
                We are rebuilding the review submission and moderation flow. Existing reviews are
                shown below. Check back soon to add yours — we would love to hear what worked and
                what did not.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled
            className="btn btn-disabled btn-sm shrink-0 gap-2"
            title="Review submissions are temporarily closed"
          >
            <Clock className="h-3.5 w-3.5" />
            Write a review
            <span className="badge badge-xs badge-ghost">Soon</span>
          </button>
        </div>
      </div>

      {loadFailed && (
        <div className="mt-6 rounded-lg border border-warning/30 bg-warning/10 p-4 text-[12.5px] text-base-content/65">
          Reviews are temporarily unavailable. Please check back in a moment.
        </div>
      )}

      {/* Summary */}
      {count > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
          <div className="card card-border bg-base-200/50">
            <div className="card-body items-center gap-1 p-5 text-center">
              <p className="text-4xl font-semibold tabular-nums tracking-tight text-base-content">
                {average.toFixed(1)}
              </p>
              <StarRow rating={average} size="lg" />
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-base-content/40">
                {count} {count === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          <div className="card card-border bg-base-200/50">
            <div className="card-body gap-2 p-5">
              {distribution.map((row) => {
                const percent = count > 0 ? Math.round((row.total / count) * 100) : 0;
                return (
                  <div key={row.rating} className="flex items-center gap-3">
                    <span className="flex w-10 items-center gap-1 text-[11px] text-base-content/50">
                      {row.rating}
                      <Star className="h-3 w-3 fill-current text-warning" />
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-base-300">
                      <div
                        className="h-full rounded-full bg-warning"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[11px] tabular-nums text-base-content/40">
                      {row.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review cards */}
      {count > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        !loadFailed && (
          <div className="mt-8 card card-border bg-base-200/50">
            <div className="card-body items-center gap-2 p-10 text-center">
              <Sparkles className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium text-base-content/70">
                No reviews published yet
              </p>
              <p className="max-w-sm text-[12.5px] text-base-content/50">
                We are collecting the first batch. Reviews will appear here when submissions
                reopen.
              </p>
            </div>
          </div>
        )
      )}

      {/* Footer CTA */}
      <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-base-300 bg-base-200/40 p-5 sm:flex-row">
        <div>
          <p className="text-sm font-semibold text-base-content/80">
            Want to see the radar for yourself?
          </p>
          <p className="mt-1 text-[12.5px] text-base-content/50">
            The risk radar is free and needs no account. Launch and position tools are paid.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link href="/dashboard" className="btn btn-outline btn-sm gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Open the radar
          </Link>
          <Link href="/#pricing" className="btn btn-primary btn-sm gap-1.5">
            View plans
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <p className="mt-5 text-[11px] leading-relaxed text-base-content/35">
        Reviews reflect individual user experiences and are not investment advice. Memecoins are
        highly volatile and most go to zero. Read the{" "}
        <Link href="/terms#risk" className="link link-hover">
          risk notice
        </Link>
        .
      </p>
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewRow }) {
  const initials = review.authorName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const planLabel = review.plan ? PLAN_LABEL[review.plan] ?? review.plan : null;
  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(review.createdAt);

  return (
    <article className="card card-border bg-base-200/50">
      <div className="card-body gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <StarRow rating={review.rating} />
          {review.featured && (
            <span className="badge badge-outline badge-xs shrink-0 border-primary/30 text-[9px] uppercase tracking-[0.08em] text-primary">
              Featured
            </span>
          )}
        </div>

        {review.title && (
          <h2 className="text-[14px] font-semibold tracking-tight text-base-content/90">
            {review.title}
          </h2>
        )}

        <div className="relative">
          <Quote className="absolute -left-1 -top-1 h-4 w-4 text-base-content/10" />
          <p className="pl-4 text-[13px] leading-relaxed text-base-content/60">{review.body}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-base-300 pt-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary ring-1 ring-primary/20">
              {initials || "?"}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-medium text-base-content/80">
                {review.authorName}
              </span>
              {review.handle && (
                <span className="block truncate text-[10.5px] text-base-content/40">
                  {review.handle}
                </span>
              )}
            </span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {planLabel && (
              <span className="badge badge-outline badge-xs border-base-300 text-[9px] uppercase tracking-[0.08em] text-base-content/45">
                {planLabel}
              </span>
            )}
            <span className="text-[10px] text-base-content/30">{date}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const className = size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${className} ${
            star <= Math.round(rating)
              ? "fill-warning text-warning"
              : "fill-base-300 text-base-300"
          }`}
        />
      ))}
    </span>
  );
}
