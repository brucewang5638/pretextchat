import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
}

const CONTROL_BASE_CLASS =
  "rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100";

export function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-[13px] font-semibold tracking-wide text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

export function FormInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[CONTROL_BASE_CLASS, className].filter(Boolean).join(" ")}
    />
  );
}

export function FormTextArea(
  { className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={["min-h-[126px]", CONTROL_BASE_CLASS, className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
