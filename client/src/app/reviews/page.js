'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.username) setName(u.username);
      } catch (e) {
        console.error(e);
      }
    }
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          feedback: feedback.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg('🎉 Thank you for sharing your feedback!');
        setFeedback('');
        if (data.review) {
          setReviews((prev) => [data.review, ...prev]);
        } else {
          fetchReviews();
        }
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to submit review');
      }
    } catch (err) {
      setErrorMsg('Server connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
        {/* Top Card: Share Your Thoughts (Matching Image 5) */}
        <div className="p-8 rounded-3xl bg-[#14141a] border border-white/10 shadow-xl mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white mb-2 flex items-center justify-center gap-2">
            📝 Share Your Thoughts
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm text-center mb-6">
            Help us improve HabitBuddy by submitting your honest feedback and rating.
          </p>

          {successMsg && (
            <div className="p-3 mb-6 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 mb-6 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Your Name</label>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Star Rating Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-transform hover:scale-125 ${
                      star <= rating ? 'text-amber-400' : 'text-gray-600'
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-xs text-gray-400 ml-2 self-center font-medium">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Your Review</label>
              <textarea
                rows={4}
                required
                placeholder="Write your review here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>🚀</span> {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Bottom Card: What People Say (Matching Image 5) */}
        <div className="p-8 rounded-3xl bg-[#14141a] border border-white/10 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
            🌟 What People Say
          </h2>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading community reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No reviews submitted yet. Be the first to share your experience!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-xs">
                        {rev.username ? rev.username.charAt(0).toUpperCase() : 'U'}
                      </span>
                      <span className="font-bold text-sm text-white">{rev.username || 'Anonymous'}</span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <div className="text-amber-400 text-xs mb-2">
                    {'★'.repeat(rev.rating || 5)}
                    <span className="text-gray-600">{'★'.repeat(5 - (rev.rating || 5))}</span>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{rev.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
