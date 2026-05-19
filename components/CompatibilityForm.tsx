'use client'

import { useState, useEffect } from 'react'
import type { SavedProfile, BloodType, CompatibilityPerson } from '@/lib/types'
import { calcRokuseiStar, getZodiacSign, getTodayString } from '@/lib/calculations'
import { useLang } from '@/lib/i18n-context'

interface CompatibilityFormProps {
  profiles: SavedProfile[]
  onSubmit: (personA: CompatibilityPerson, personB: CompatibilityPerson) => void
}

const BLOOD_TYPES: BloodType[] = ['A', 'B', 'O', 'AB']

const emptyPerson = (): CompatibilityPerson => ({
  name: '',
  birthdate: '',
  bloodType: 'A',
  rokuseiStar: '',
})

interface PersonCardProps {
  label: string
  colorClass: string
  person: CompatibilityPerson
  profiles: SavedProfile[]
  onChange: (person: CompatibilityPerson) => void
  selectFromProfileLabel: string
  labelName: string
  labelBirthdate: string
  labelBloodType: string
  placeholderName: string
}

function PersonCard({ label, colorClass, person, profiles, onChange, selectFromProfileLabel, labelName, labelBirthdate, labelBloodType, placeholderName }: PersonCardProps) {
  const [showProfilePicker, setShowProfilePicker] = useState(false)

  const zodiac = person.birthdate ? getZodiacSign(person.birthdate) : ''
  const rokusei = person.birthdate ? (person.rokuseiStar || calcRokuseiStar(person.birthdate)) : ''

  const handleBirthdateChange = (birthdate: string) => {
    const newRokusei = birthdate ? calcRokuseiStar(birthdate) : ''
    onChange({ ...person, birthdate, rokuseiStar: newRokusei })
  }

  const applyProfile = (profile: SavedProfile) => {
    onChange({
      name: profile.name,
      birthdate: profile.birthdate,
      bloodType: profile.bloodType,
      rokuseiStar: profile.rokuseiStar || (profile.birthdate ? calcRokuseiStar(profile.birthdate) : ''),
    })
    setShowProfilePicker(false)
  }

  return (
    <div className={`glass-card p-5 border ${colorClass}`}>
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
            {label.charAt(0)}
          </span>
          {label}
        </h3>
        {profiles.length > 0 && (
          <button
            type="button"
            onClick={() => setShowProfilePicker((v) => !v)}
            className="text-xs text-purple-400 hover:text-purple-300 border border-purple-700/40 hover:border-purple-500/50 rounded-lg px-2.5 py-1 transition-colors"
          >
            👤 {selectFromProfileLabel}
          </button>
        )}
      </div>

      {/* Profile Picker */}
      {showProfilePicker && profiles.length > 0 && (
        <div className="mb-4 space-y-2 animate-fade-in">
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyProfile(p)}
              className="w-full glass-card p-3 border border-white/10 hover:border-purple-500/50 text-left transition-all rounded-xl flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-base flex-shrink-0">
                👤
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {p.label && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                      {p.label}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-white">{p.name}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {p.birthdate}　{p.bloodType}型
                </p>
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowProfilePicker(false)}
            className="w-full text-xs text-slate-500 hover:text-slate-400 py-1 transition-colors"
          >
            閉じる
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* 名前 */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            {labelName} <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            className="fortune-input"
            placeholder={placeholderName}
            value={person.name}
            onChange={(e) => onChange({ ...person, name: e.target.value })}
            required
          />
        </div>

        {/* 生年月日 */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            {labelBirthdate} <span className="text-rose-400">*</span>
          </label>
          <input
            type="date"
            className="fortune-input fortune-select"
            value={person.birthdate}
            max={getTodayString()}
            onChange={(e) => handleBirthdateChange(e.target.value)}
            required
          />
          {person.birthdate && (zodiac || rokusei) && (
            <p className="mt-1.5 text-xs text-purple-300 flex gap-3 flex-wrap">
              {zodiac && <span>星座: <span className="font-semibold">{zodiac}</span></span>}
              {rokusei && <span>六星: <span className="font-semibold">{rokusei}</span></span>}
            </p>
          )}
        </div>

        {/* 血液型 */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            {labelBloodType} <span className="text-rose-400">*</span>
          </label>
          <div className="flex gap-2">
            {BLOOD_TYPES.map((bt) => (
              <button
                key={bt}
                type="button"
                onClick={() => onChange({ ...person, bloodType: bt })}
                className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  person.bloodType === bt
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                    : 'border-purple-900/40 text-slate-400 hover:border-purple-500/50 hover:text-slate-300'
                }`}
              >
                {bt}型
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CompatibilityForm({ profiles, onSubmit }: CompatibilityFormProps) {
  const { tr } = useLang()
  const [personA, setPersonA] = useState<CompatibilityPerson>(emptyPerson())
  const [personB, setPersonB] = useState<CompatibilityPerson>(emptyPerson())

  // Pre-fill from saved profiles if available
  useEffect(() => {
    if (profiles.length >= 1 && !personA.name) {
      const p = profiles[0]
      setPersonA({
        name: p.name,
        birthdate: p.birthdate,
        bloodType: p.bloodType,
        rokuseiStar: p.rokuseiStar || (p.birthdate ? calcRokuseiStar(p.birthdate) : ''),
      })
    }
    if (profiles.length >= 2 && !personB.name) {
      const p = profiles[1]
      setPersonB({
        name: p.name,
        birthdate: p.birthdate,
        bloodType: p.bloodType,
        rokuseiStar: p.rokuseiStar || (p.birthdate ? calcRokuseiStar(p.birthdate) : ''),
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles])

  const isValid =
    personA.name && personA.birthdate && personA.bloodType &&
    personB.name && personB.birthdate && personB.bloodType

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    const finalA = { ...personA, rokuseiStar: personA.rokuseiStar || calcRokuseiStar(personA.birthdate) }
    const finalB = { ...personB, rokuseiStar: personB.rokuseiStar || calcRokuseiStar(personB.birthdate) }
    onSubmit(finalA, finalB)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <PersonCard
        label={tr.compatPersonA}
        colorClass="border-purple-700/40"
        person={personA}
        profiles={profiles}
        onChange={setPersonA}
        selectFromProfileLabel={tr.selectFromProfile}
        labelName={tr.labelName}
        labelBirthdate={tr.labelBirthdate}
        labelBloodType={tr.labelBloodType}
        placeholderName={tr.placeholderName}
      />

      {/* Connector */}
      <div className="flex items-center justify-center py-1">
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-4 bg-gradient-to-b from-purple-600/40 to-pink-600/40" />
          <div className="text-2xl">💕</div>
          <div className="w-px h-4 bg-gradient-to-b from-pink-600/40 to-purple-600/40" />
        </div>
      </div>

      <PersonCard
        label={tr.compatPersonB}
        colorClass="border-pink-700/40"
        person={personB}
        profiles={profiles}
        onChange={setPersonB}
        selectFromProfileLabel={tr.selectFromProfile}
        labelName={tr.labelName}
        labelBirthdate={tr.labelBirthdate}
        labelBloodType={tr.labelBloodType}
        placeholderName={tr.placeholderName}
      />

      <button
        type="submit"
        disabled={!isValid}
        className={`w-full py-4 rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-2 ${
          isValid
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/30'
            : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
        }`}
      >
        <span>{tr.compatSubmit}</span>
      </button>
    </form>
  )
}
