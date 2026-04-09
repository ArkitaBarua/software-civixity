import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

// Hardcoded, presentation-ready Testing UI for Civixity (mirrors attached sample)
// Includes: Executive summary, category progress, successful tests, known issues, architecture,
// coverage goals, and detailed test case list. Also retains a small harness for API demos.

type TestCase = {
  id: string;
  category: string;
  title: string;
  status: "pass" | "fail" | "pending";
};

const TEST_CASES: TestCase[] = [
  { id: "TC_CVX_001", category: "API - Chatbot", title: "Responds to valid prompt", status: "pass" },
  { id: "TC_CVX_002", category: "API - Chatbot", title: "400 for empty message", status: "pass" },
  { id: "TC_CVX_003", category: "API - Chatbot", title: "Safe 500 on provider/env error", status: "pending" },
  { id: "TC_CVX_004", category: "API - Detect Image", title: "Authenticity analysis returns result", status: "pass" },
  { id: "TC_CVX_005", category: "API - Detect Image", title: "Unsupported type rejected (415)", status: "pass" },
  { id: "TC_CVX_006", category: "API - Detect Image", title: "Large file rejected (413)", status: "pass" },
  { id: "TC_CVX_007", category: "API - Posts", title: "Fetch by location", status: "pass" },
  { id: "TC_CVX_008", category: "API - Posts", title: "Fetch by category", status: "pass" },
  { id: "TC_CVX_009", category: "API - Posts", title: "Summary endpoint", status: "pass" },
  { id: "TC_CVX_010", category: "UI", title: "HomePage renders essentials", status: "pass" },
  { id: "TC_CVX_011", category: "UI", title: "ChatBot prompt → reply (mock)", status: "pass" },
  { id: "TC_CVX_012", category: "UI", title: "Heatmaps shows markers (mock)", status: "pending" },
  { id: "TC_CVX_013", category: "UI", title: "Redeem form validation", status: "pass" },
  { id: "TC_CVX_014", category: "Functional", title: "Report: upload triggers authenticity UI", status: "pass" },
  { id: "TC_CVX_015", category: "Functional", title: "Volunteer join flow", status: "pending" },
  { id: "TC_CVX_016", category: "Functional", title: "Chatbot prompt → answer card", status: "pass" },
  { id: "TC_CVX_017", category: "Validation", title: "Empty report blocked", status: "pass" },
  { id: "TC_CVX_018", category: "Security", title: "XSS escaped in title", status: "pass" },
  { id: "TC_CVX_019", category: "Performance", title: "Chatbot p95 < 800ms", status: "pending" },
  { id: "TC_CVX_020", category: "Performance", title: "Detect-image p95 < 2s", status: "pending" },
  { id: "TC_CVX_021", category: "Resilience", title: "Burst returns 429 w/ retry-after", status: "pending" },
  { id: "TC_CVX_022", category: "Accessibility", title: "Lighthouse ≥ 90", status: "pending" }
];

const calcSummary = () => {
  const total = TEST_CASES.length;
  const pass = TEST_CASES.filter(t => t.status === "pass").length;
  const fail = TEST_CASES.filter(t => t.status === "fail").length;
  const pending = TEST_CASES.filter(t => t.status === "pending").length;
  const rate = total > 0 ? Math.round((pass / total) * 100) : 0;
  return { total, pass, fail, pending, rate };
};

const Testing = () => {
  const [chatPrompt, setChatPrompt] = useState("How to report a pothole?");
  const [chatResult, setChatResult] = useState<string>("");
  const [detectResult, setDetectResult] = useState<string>("");
  const [detectLoading, setDetectLoading] = useState(false);

  const { total, pass, fail, pending, rate } = calcSummary();

  const callChatbot = async () => {
    // [TC_CVX_001]
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: chatPrompt, userId: null })
    });
    const data = await res.json();
    setChatResult(res.ok ? data.response : JSON.stringify(data));
  };

  const callChatbotEmpty = async () => {
    // [TC_CVX_002]
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "", userId: null })
    });
    const data = await res.json();
    setChatResult(JSON.stringify({ status: res.status, body: data }));
  };

  const uploadImage = async (file: File) => {
    const form = new FormData();
    form.append('image', file);
    setDetectLoading(true);
    try {
      // [TC_CVX_004]
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/detect-image`, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      setDetectResult(JSON.stringify({ status: res.status, body: data }));
    } finally {
      setDetectLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <Card className="border-slate-200">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">Civixity – Testing & Quality Assurance Report</div>
            <div className="text-sm text-slate-600">Hardcoded UI for presentation and documentation</div>
          </div>
          <Button variant="secondary">Download as PDF</Button>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700">This report presents comprehensive testing documentation for Civixity, a civic engagement platform with AI assistant, image authenticity detection, volunteer activities, and rewards.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-xs text-slate-500">Total Tests</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{pass}</div>
              <div className="text-xs text-slate-500">Passing</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{pending}</div>
              <div className="text-xs text-slate-500">Pending</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{rate}%</div>
              <div className="text-xs text-slate-500">Pass Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Frontend UI Tests', done: 6, total: 8, color: 'bg-teal-500' },
            { label: 'Backend API Tests', done: 8, total: 9, color: 'bg-blue-500' },
            { label: 'Integration Tests', done: 5, total: 5, color: 'bg-purple-500' },
            { label: 'Performance & A11y', done: 0, total: 4, color: 'bg-amber-500' },
          ].map((row) => {
            const pct = Math.round((row.done / row.total) * 100);
            return (
              <div key={row.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium">{row.label}</div>
                  <div className="text-slate-500">{row.done} passed / {row.total} total</div>
                </div>
                <div className="h-2 w-full rounded bg-slate-200 overflow-hidden">
                  <div className={`h-2 ${row.color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Successful Tests */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Successful Test Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
              <li>[TC_CVX_004] Detect Image returns structured result</li>
              <li>[TC_CVX_005] Unsupported type rejected with 415</li>
              <li>[TC_CVX_006] Large file rejected with 413</li>
              <li>[TC_CVX_001] Chatbot answers standard prompts</li>
              <li>[TC_CVX_010] HomePage renders with nav & hero</li>
              <li>[TC_CVX_017] Empty report blocked by validation</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Known Issues & Remediation Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="font-semibold text-red-700 mb-1">High Priority</div>
              <ul className="list-disc pl-5 space-y-1 text-red-700">
                <li>[TC_CVX_003] Provider/env error path finalization</li>
                <li>[TC_CVX_019–021] Performance and rate-limit validations</li>
              </ul>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="font-semibold text-amber-700 mb-1">Medium Priority</div>
              <ul className="list-disc pl-5 space-y-1 text-amber-700">
                <li>[TC_CVX_012] Heatmaps markers E2E with Maps mock</li>
                <li>[TC_CVX_015] Volunteer join/points accrual</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Architecture & Coverage */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Architecture</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded border p-3">
              <div className="font-semibold mb-2">Frontend Testing</div>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Vitest + React Testing Library</li>
                <li>JSDOM environment</li>
                <li>Selenium for E2E screenshots</li>
              </ul>
            </div>
            <div className="rounded border p-3">
              <div className="font-semibold mb-2">Backend Testing</div>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Supertest (Express APIs)</li>
                <li>Validation & error paths</li>
                <li>Rate limit and performance smoke</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coverage Goals & Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-1">Area</th>
                  <th className="py-1">Current</th>
                  <th className="py-1">Target</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { area: 'Frontend', current: '68%', target: '85%' },
                  { area: 'API Services', current: '76%', target: '90%' },
                  { area: 'Integration', current: '60%', target: '85%' },
                  { area: 'A11y & Perf', current: '40%', target: '80%' },
                ].map(r => (
                  <tr key={r.area} className="border-t">
                    <td className="py-1">{r.area}</td>
                    <td className="py-1">{r.current}</td>
                    <td className="py-1">{r.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Test Case List */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Test Cases & Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">ID</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Description</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {TEST_CASES.map(tc => (
                  <tr key={tc.id} className="border-t">
                    <td className="py-2 font-mono">{tc.id}</td>
                    <td className="py-2">{tc.category}</td>
                    <td className="py-2">{tc.title}</td>
                    <td className="py-2">
                      {tc.status === 'pass' && <span className="rounded px-2 py-1 text-xs bg-emerald-100 text-emerald-700">Passed</span>}
                      {tc.status === 'fail' && <span className="rounded px-2 py-1 text-xs bg-red-100 text-red-700">Failed</span>}
                      {tc.status === 'pending' && <span className="rounded px-2 py-1 text-xs bg-amber-100 text-amber-700">Pending</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Minimal harness for API demos (kept for screenshots) */}
      <Card>
        <CardHeader>
          <CardTitle>API Demonstration (for screenshots)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* [TC_CVX_001] */}
          <div className="flex gap-2">
            <Input value={chatPrompt} onChange={e => setChatPrompt(e.target.value)} placeholder="Prompt" />
            <Button onClick={callChatbot}>Send</Button>
            {/* [TC_CVX_002] */}
            <Button variant="outline" onClick={callChatbotEmpty}>Send Empty</Button>
          </div>
          <pre className="text-xs whitespace-pre-wrap bg-muted p-3 rounded h-24 overflow-auto">{chatResult}</pre>

          <div className="pt-2" />
          <div className="text-sm font-medium">Image Authenticity Detection</div>
          {/* [TC_CVX_004] [TC_CVX_005] [TC_CVX_006] */}
          <Input type="file" accept="image/*" onChange={e => e.target.files && uploadImage(e.target.files[0])} />
          {detectLoading ? <div className="text-xs">Uploading...</div> : null}
          <pre className="text-xs whitespace-pre-wrap bg-muted p-3 rounded h-24 overflow-auto">{detectResult}</pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default Testing;


