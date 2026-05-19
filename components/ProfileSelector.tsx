'use client'

import { useState } from 'react'
import type { SavedProfile, BloodType, RokuseiStar } from '@/lib/types'
import { useLang } from '@/lib/i18n-context'

const BLOOD_TYPES: BloodType[] = ['A', 'B', 'O', 'AB']

interface ProfileSelectorProps {
  profiles: SavedProfile[]
  selectedId: string | null
  onSelect: (profile: SavedProfile) => void
  onSave: (profile: SavedProfile) => void
  onDelete: (id: string) => void
}

const emptyForm = (): Omit<SavedProfile, 'id'> => ({
  label: '',
  name: '',
  birthdate: '',
  bloodType: 'A',
  rokuseiStar: '',
  isReigoSeijin: false,
})

function formatBirthdate(birthdate: string): string {
  if (!birthdate) return ''
  const [y, m, d] = birthdate.split('-')
  return `${y}年${parseInt(m)}月${parseInt(d)}日`
}

export default function ProfileSelector({
  profiles,
  selectedId,
  onSelect,
  onSave,
  onDelete,
}: ProfileSelectorProps) {
  const { tr } = useLang()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<SavedProfile, 'id'>>(emptyForm())
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm())
    setShowForm(true)
  }

  const openEdit = (profile: SavedProfile) => {
    setEditingId(profile.id)
    setForm({
      label: profile.label,
      name: profile.name,
      birthdate: profile.birthdate,
      bloodType: profile.bloodType,
      rokuseiStar: profile.rokuseiStar,
      isReigoSeijin: profile.isReigoSeijin,
    })
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.name || !form.birthdate) return
    const id = editingId ?? `profile_${Date.now()}`
    onSave({ id, ...form })
    setShowForm(false)
    setEditingId(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const canAdd = profiles.length < 2

  return (
    <div className="mb-5">
      {/* プロフィールカード一覧 */}
      {profiles.length > 0 && (
        <div className="flex flex-col gap-3 mb-3">
          {profiles.map((p) => {
            const isSelected = p.id === selectedId
            return (
              <div
                key={p.id}
                className={`glass-card p-4 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-purple-500/70 bg-purple-900/20'
                    : 'border-white/10 hover:border-purple-500/40'
                }`}
                onClick={() => onSelect(p)}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* 左: プロフィール情報 */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                      isSelected ? 'bg-purple-600/50' : 'bg-white/5'
                    }`}>
                      👤
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        {p.label && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-purple-600/40 text-purple-200'
                              : 'bg-white/10 text-slate-300'
                          }`}>
                            {p.label}
                          </span>
                        )}
                        <span className="text-sm font-semibold text-white truncate">{p.name}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {formatBirthdate(p.birthdate)}　{p.bloodType}型
                      </p>
                    </div>
                  </div>

                  {/* 右: 操作ボタン */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {isSelected && (
                      <span className="text-xs text-purple-400 font-semibold hidden sm:inline">{tr.profileSelected}</span>
                    )}
                    <button
                      onClick={() => openEdit(p)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      title={tr.profileEdit}
                    >
                      ✏️
                    </button>
                    {deleteConfirmId === p.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { onDelete(p.id); setDeleteConfirmId(null) }}
                          className="text-xs bg-rose-600/80 hover:bg-rose-600 text-white px-2 py-1 rounded-lg transition-colors"
                        >
                          削除
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs bg-white/10 hover:bg-white/20 text-slate-300 px-2 py-1 rounded-lg transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(p.id)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-900/30 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
                        title="削除"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 追加ボタン */}
      {canAdd && !showForm && (
        <button
          onClick={openNew}
          className="w-full glass-card p-3 border border-dashed border-purple-700/40 hover:border-purple-500/60 text-purple-400 hover:text-purple-300 text-sm font-medium transition-all flex items-center justify-center gap-2 rounded-xl"
        >
          <span className="text-lg leading-none">＋</span>
          <span>{profiles.length === 0 ? tr.profileRegister : tr.profileAdd}</span>
        </button>
      )}

      {/* 登録・編集フォーム */}
      {showForm && (
        <div className="glass-card p-4 border border-purple-700/40 animate-fade-in">
          <p className="text-xs font-semibold text-purple-300 mb-4">
            {editingId ? `✏️ ${tr.profileEdit}` : `➕ ${tr.profileNew}`}
          </p>

          <div className="space-y-3">
            {/* ニックネーム */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">{tr.profileNickname}</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="自分"
                className="input-field w-full"
                maxLength={10}
              />
            </div>

            {/* 名前 */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">{tr.labelName} <span className="text-rose-400">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={tr.placeholderName}
                className="input-field w-full"
              />
            </div>

            {/* 生年月日 */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">{tr.labelBirthdate} <span className="text-rose-400">*</span></label>
              <input
                type="date"
                value={form.birthdate}
                onChange={(e) => setForm((f) => ({ ...f, birthdate: e.target.value }))}
                className="input-field w-full"
              />
            </div>

            {/* 血液型 */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">{tr.labelBloodType}</label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map((bt) => (
                  <button
                    key={bt}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, bloodType: bt }))}
                    className={`py-2 rounded-lg text-sm font-semibold border transition-all ${
                      form.bloodType === bt
                        ? 'bg-purple-600/40 border-purple-500/60 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-purple-500/40'
                    }`}
                  >
                    {bt}型
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={!form.name || !form.birthdate}
              className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              {tr.profileSave}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              {tr.profileCancel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
