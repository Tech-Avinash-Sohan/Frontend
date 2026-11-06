import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import { FieldGrid } from "../../../components/common/crud_screen";
import { settingsService } from "../../../services/settings_service";
import { useSchool } from "../../../context/school_context";
import { apiErrors } from "../../../utils/validation";

/** W42 – GET / PATCH /fees/settings/: receipt prefix + next number, part payment, online fee payment. */
export default function ReceiptNumbering() {
  const { notify } = useSchool();
  const [v, setV] = useState(null);
  const [errors, setErrors] = useState({});
  useEffect(() => { settingsService.feeSettings().then(setV); }, []);
  if (!v) return <LoadingState />;
  const save = async () => {
    try {
      setV(await settingsService.saveFeeSettings(v));
      notify("Fee settings saved");
    } catch (e) {
      setErrors(apiErrors(e));
    }
  };
  return (
    <>
      <PageHeader code="W42" title="Fee settings & receipt numbers" subtitle={`Next receipt: ${v.next_receipt_preview}`} />
      <section className="card form-card">
        {errors._ && <div className="alert alert-error">{errors._}</div>}
        <FieldGrid values={v} errors={errors} set={(k, x) => setV((o) => ({ ...o, [k]: x }))} fields={[
          { name: "receipt_prefix", label: "Receipt prefix", hint: "e.g. REC, XYZ26-" }, { name: "next_receipt_no", label: "Next number", type: "number" },
          { name: "receipt_digits", label: "Digits", type: "number", hint: "5 → REC00001" },
          { name: "allow_partial_payment", label: "Allow part payment", type: "checkbox" },
          { name: "online_payment_enabled", label: "Parents can pay fees in the Parent app", type: "checkbox" },
          { name: "reset_every_year", label: "Restart numbering every year", type: "checkbox" },
          { name: "receipt_footer", label: "Receipt footer", span: true }]} />
        <div className="form-actions"><button className="btn btn-primary" onClick={save}>Save</button></div>
      </section>
    </>
  );
}
