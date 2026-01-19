import React, { useMemo, useState, useEffect } from "react";
import { KeyRound, Copy, RefreshCw, ShieldCheck } from "lucide-react";

const ROLE_PREFIX = {
  Student: "STU",
  Parent: "PAR",
  Teacher: "TCH",
};

const ROLE_LABEL = {
  Student: "Batch / Grade Code",
  Parent: "Family / Ward Code",
  Teacher: "Department / Subject Code",
};

const MIN_PASSWORD_LENGTH = 10;
const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWERCASE = "abcdefghjkmnpqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%&*?";
const ALL_CHARS = `${UPPERCASE}${LOWERCASE}${NUMBERS}${SYMBOLS}`;

const meetsPolicy = (password = "") =>
  typeof password === "string" &&
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password);

const randomChar = (source) => source.charAt(Math.floor(Math.random() * source.length));

const shuffle = (value) => {
  const arr = value.split("");
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
};

const generateSecurePassword = () => {
  let password = "";
  do {
    let draft = "";
    draft += randomChar(UPPERCASE);
    draft += randomChar(LOWERCASE);
    draft += randomChar(NUMBERS);
    draft += randomChar(SYMBOLS);
    while (draft.length < MIN_PASSWORD_LENGTH) {
      draft += randomChar(ALL_CHARS);
    }
    password = shuffle(draft);
  } while (!meetsPolicy(password));
  return password;
};

const buildPortalId = ({ role, batchCode, joiningYear }) => {
  const prefix = ROLE_PREFIX[role] || "EEC";
  const sanitizedBatch =
    (batchCode || "GEN").toString().replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "GEN";
  const year = (joiningYear || new Date().getFullYear()).toString().slice(-2);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${year}${sanitizedBatch}-${random}`;
};

const CredentialGeneratorButton = ({
  buttonText = "Generate ID",
  buttonClassName = "",
  icon: Icon = KeyRound,
  defaultRole = "Student",
  allowRoleSelection = true,
  size = "md",
  onGenerate,
  prefillValues = null,
  disabled = false,
}) => {
  const buildInitialForm = (overrides = {}) => ({
    role: defaultRole,
    batchCode: "",
    joiningYear: new Date().getFullYear(),
    referenceName: "",
    ...overrides,
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(buildInitialForm(prefillValues || undefined));
  const [creds, setCreds] = useState(null);

  const descriptor = useMemo(
    () => ROLE_LABEL[form.role] || "Batch / Grade Code",
    [form.role]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = () => {
    const id = buildPortalId(form);
    const password = generateSecurePassword();
    setCreds({ id, password });
    onGenerate?.({ id, password, ...form });
  };

  const handleCopy = (value) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
  };

  const handleReset = () => {
    setForm(buildInitialForm(prefillValues || undefined));
    setCreds(null);
  };

  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(prefillValues || undefined));
      setCreds(null);
    }
  }, [open, prefillValues]);

  const triggerClasses =
    size === "sm"
      ? "px-3 py-2 text-sm"
      : size === "lg"
      ? "px-6 py-3 text-base"
      : "px-4 py-2.5 text-sm";

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen(true);
        }}
        className={`inline-flex items-center gap-2 rounded-lg font-medium bg-yellow-600 text-white hover:bg-yellow-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${triggerClasses} ${buttonClassName}`}
      >
        {Icon && <Icon size={16} />} {buttonText}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Generate Portal Credentials
                </h3>
                <p className="text-sm text-gray-500">
                  Create unique login IDs and passwords for the selected role.
                </p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  handleReset();
                }}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allowRoleSelection ? (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                    >
                      <option value="Student">Student</option>
                      <option value="Parent">Parent</option>
                      <option value="Teacher">Teacher</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <div className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-700">
                      {form.role}
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {descriptor}
                  </label>
                  <input
                    type="text"
                    name="batchCode"
                    value={form.batchCode}
                    onChange={handleChange}
                    placeholder="e.g. 10A, SCI, PTA"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Joining Year
                  </label>
                  <input
                    type="number"
                    name="joiningYear"
                    min="2000"
                    max="2100"
                    value={form.joiningYear}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Name / Reference
                  </label>
                  <input
                    type="text"
                    name="referenceName"
                    value={form.referenceName}
                    onChange={handleChange}
                    placeholder="Helps track who gets this ID"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  <RefreshCw size={16} /> Reset Form
                </button>
                <button
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <ShieldCheck size={16} /> Generate Credentials
                </button>
              </div>

              {creds && (
                <div className="border border-yellow-200 bg-yellow-50 rounded-2xl p-4 space-y-4">
                  <div>
                    <p className="text-xs uppercase text-yellow-700 font-semibold">
                      Generated ID
                    </p>
                    <div className="flex items-center justify-between mt-1 bg-white rounded-xl px-4 py-2 border border-yellow-100">
                      <span className="font-mono text-gray-800">{creds.id}</span>
                      <button
                        onClick={() => handleCopy(creds.id)}
                        className="text-gray-500 hover:text-yellow-600"
                        title="Copy ID"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-yellow-700 font-semibold">
                      Temporary Password
                    </p>
                    <div className="flex items-center justify-between mt-1 bg-white rounded-xl px-4 py-2 border border-yellow-100">
                      <span className="font-mono text-gray-800">
                        {creds.password}
                      </span>
                      <button
                        onClick={() => handleCopy(creds.password)}
                        className="text-gray-500 hover:text-yellow-600"
                        title="Copy password"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  {form.referenceName && (
                    <p className="text-xs text-gray-500">
                      Assign to:{" "}
                      <span className="font-semibold">
                        {form.referenceName}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CredentialGeneratorButton;
