import { CustomAppTips } from "./CustomAppTips";
import { FormField, FormInput, FormTextArea } from "./FormField";
import type { CustomAppForm } from "../launch.types";
import { IconButton } from "../../../shared/ui/IconButton";
import { CloseIcon, PlusIcon } from "../../../shared/ui/icons";

interface CustomAppModalProps {
  isOpen: boolean;
  draft: CustomAppForm;
  error: string | null;
  isSaving: boolean;
  onChange: (field: keyof CustomAppForm, value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function CustomAppModal({
  isOpen,
  draft,
  error,
  isSaving,
  onChange,
  onClose,
  onSave,
}: CustomAppModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.22),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.16),transparent_44%),rgba(15,23,42,0.58)] px-4 py-6 backdrop-blur-[8px]">
      <div className="w-full max-w-[920px] overflow-hidden rounded-[32px] border border-white/30 bg-[rgba(255,255,255,0.94)] shadow-[0_34px_100px_rgba(15,23,42,0.32)]">
        <div className="relative border-b border-white/40 bg-[linear-gradient(115deg,rgba(99,102,241,0.16),rgba(56,189,248,0.08),rgba(16,185,129,0.12))] px-7 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4f46e5,#0ea5e9)] text-white shadow-[0_10px_24px_rgba(79,70,229,0.28)]">
                <PlusIcon size={24} />
              </div>
              <div className="space-y-1">
                <h2 className="text-[26px] font-bold tracking-[-0.03em] text-slate-900">
                  添加自定义 App
                </h2>
                <p className="max-w-[620px] text-[14px] leading-6 text-slate-600">
                  输入站点入口后即可加入应用目录；你后续可以一键提交到 GitHub 审核通道。
                </p>
              </div>
            </div>
            <IconButton
              aria-label="关闭添加自定义应用弹窗"
              className="cursor-pointer rounded-full border border-white/40 bg-white/70 p-2.5 text-slate-500 transition duration-200 hover:border-slate-200 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              onClick={onClose}
            >
              <CloseIcon size={18} strokeWidth={2} />
            </IconButton>
          </div>
        </div>

        <div className="grid gap-6 px-7 py-6 lg:grid-cols-[minmax(0,1fr)_270px]">
          <div className="grid gap-4">
            <FormField label="应用名称">
              <FormInput
                type="text"
                value={draft.name}
                onChange={(event) => onChange("name", event.target.value)}
                placeholder="例如：Linear AI"
              />
            </FormField>

            <FormField label="入口地址">
              <FormInput
                type="url"
                value={draft.startUrl}
                onChange={(event) => onChange("startUrl", event.target.value)}
                placeholder="https://example.com"
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="分类">
                <FormInput
                  type="text"
                  value={draft.category || ""}
                  onChange={(event) => onChange("category", event.target.value)}
                  placeholder="自定义应用"
                />
              </FormField>

              <div className="rounded-2xl border border-dashed border-slate-200 bg-[linear-gradient(145deg,#f8fafc,#f1f5f9)] px-4 py-3 text-[13px] leading-6 text-slate-600">
                GitHub 审核会在系统浏览器打开；未登录时直接由 GitHub 页面引导登录即可。
              </div>
            </div>

            <FormField label="描述">
              <FormTextArea
                value={draft.description || ""}
                onChange={(event) => onChange("description", event.target.value)}
                placeholder="补充这个应用的用途、适合的 AI 模式、是否需要登录等"
              />
            </FormField>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-600">
                {error}
              </div>
            )}
          </div>

          <CustomAppTips />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200/80 bg-slate-50/80 px-7 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-[14px] font-semibold text-slate-600 transition duration-200 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            取消
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="cursor-pointer rounded-full bg-[linear-gradient(135deg,#111827,#334155)] px-5 py-2 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(15,23,42,0.22)] transition duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "保存中..." : "保存到我的应用"}
          </button>
        </div>
      </div>
    </div>
  );
}
