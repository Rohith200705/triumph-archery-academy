import { useSettings } from '../lib/settings.js';

const PROGRAMS = ['Beginner', 'Intermediate', 'Advanced', 'Competitive'];
const AGE_GROUPS = ['6+ Years', 'Youth', 'Adult', 'All Levels'];
const BATCHES = [
  'Saturday Morning',
  'Saturday Evening',
  'Sunday Morning',
  'Sunday Evening',
  'Both Weekends',
  'Flexible'
];
const GENDERS = ['Male', 'Female', 'Other'];

function Check({ on, label }) {
  return (
    <span>
      <i className={'fd-box' + (on ? ' on' : '')} />
      {label}
    </span>
  );
}

function Item({ label, value, full }) {
  return (
    <div className={'fd-item' + (full ? ' full' : '')}>
      <div className="fd-label">{label}</div>
      <div className="fd-value">{value || ''}</div>
    </div>
  );
}

export default function FormDocument({ data }) {
  const d = data || {};
  const s = useSettings();

  return (
    <div className="formdoc" id="formdoc">
      <div className="formdoc-inner">
        <div className="fd-head">
          <div className="fd-logo">
            <span className="aim">⌖</span>
            {s.academyName}
            <span style={{ fontSize: 6, marginTop: 4 }}>{s.motto}</span>
          </div>

          <div className="fd-title">
            <div className="name">{s.academyName}</div>
            <div className="motto">{s.motto}</div>
            <div className="hr" />
            <div className="form-name">{s.formTitle}</div>
            <div
              style={{
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: 11,
                color: '#7b6f60',
                marginTop: 8,
                letterSpacing: 1
              }}
            >
              Application No: <b style={{ color: '#6d1220' }}>{d.applicationNo || '—'}</b>
            </div>
          </div>

          <div className="fd-photo" />
        </div>

        <div className="fd-section">
          <span className="n">1</span>
          <span className="t">Archer Details</span>
          <span className="r" />
        </div>
        <div className="fd-grid">
          <Item label="Archer Name" value={d.archerName} />
          <Item label="Age / Date of Birth" value={d.dob} />
          <div className="fd-item">
            <div className="fd-label">Gender</div>
            <div className="fd-checks">
              {GENDERS.map((g) => (
                <Check key={g} on={d.gender === g} label={g} />
              ))}
            </div>
          </div>
          <Item label="Parent / Guardian Name" value={d.parentName} />
          <Item label="Contact Number" value={d.contactNumber} />
          <Item label="Alternate Contact" value={d.alternateContact} />
          <Item label="Email" value={d.email} full />
          <Item label="Address – Line 1" value={d.addressLine1} full />
          <Item label="Address – Line 2" value={d.addressLine2} full />
        </div>

        <div className="fd-section">
          <span className="n">2</span>
          <span className="t">Program Details</span>
          <span className="r" />
        </div>
        <div className="fd-grid">
          <div className="fd-item">
            <div className="fd-label">Program Applying For</div>
            <div className="fd-checks">
              {PROGRAMS.map((p) => (
                <Check key={p} on={d.program === p} label={p} />
              ))}
            </div>
          </div>
          <div className="fd-item">
            <div className="fd-label">Age Group</div>
            <div className="fd-checks">
              {AGE_GROUPS.map((p) => (
                <Check key={p} on={d.ageGroup === p} label={p} />
              ))}
            </div>
          </div>
          <div className="fd-item full">
            <div className="fd-label">Preferred Weekend Batch (Please Specify)</div>
            <div className="fd-checks">
              {BATCHES.map((p) => (
                <Check key={p} on={d.weekendBatch === p} label={p} />
              ))}
            </div>
          </div>
        </div>

        <div className="fd-section">
          <span className="n">3</span>
          <span className="t">Experience &amp; Health</span>
          <span className="r" />
        </div>
        <div className="fd-grid">
          <div className="fd-item">
            <div className="fd-label">Previous Archery Experience</div>
            <div className="fd-checks">
              <Check on={d.previousExperience === 'Yes'} label="Yes" />
              <Check on={d.previousExperience === 'No'} label="No" />
              <span style={{ fontSize: 12.5, color: '#5f564a' }}>{d.experienceDetail}</span>
            </div>
          </div>
          <Item label="Medical Conditions / Allergies" value={d.medicalConditions} />
          <Item label="Emergency Contact – Name" value={d.emergencyContactName} />
          <Item label="Emergency Contact – Number" value={d.emergencyContactNumber} />
        </div>

        <div className="fd-section">
          <span className="n">4</span>
          <span className="t">Declaration</span>
          <span className="r" />
        </div>
        <div className="fd-decl">
          <i className={'fd-box' + (d.declarationAgreed ? ' on' : '')} style={{ marginTop: 3 }} />
          <span>{s.declarationText}</span>
        </div>

        <div className="fd-sigs">
          <div className="fd-sig">
            <div className="who">Archer</div>
            <div className="lines">
              <div>
                <div className="ln" />
                <div className="cap">Signature</div>
              </div>
              <div>
                <div className="ln" />
                <div className="cap">Date</div>
              </div>
            </div>
          </div>
          <div className="fd-sig">
            <div className="who">Parent / Guardian</div>
            <div className="lines">
              <div>
                <div className="ln" />
                <div className="cap">Signature</div>
              </div>
              <div>
                <div className="ln" />
                <div className="cap">Date</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fd-foot">{s.footer}</div>
    </div>
  );
}
