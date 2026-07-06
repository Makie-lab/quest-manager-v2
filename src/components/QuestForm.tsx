'use client';

import { useRef, useState } from 'react';
import { createQuest } from '@/app/actions';

export default function QuestForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      await createQuest(formData);
      formRef.current?.reset();
    } catch (e) {
      alert('Failed to create quest');
    }
    setPending(false);
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span>📜 NEW QUEST</span>
      </div>
      <form ref={formRef} action={handleSubmit} className="panel-body">
        <div className="form-field">
          <label htmlFor="name">QUEST NAME</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Slay the dragon..."
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="deadline">DEADLINE</label>
          <input
            type="datetime-local"
            id="deadline"
            name="deadline"
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="priority">PRIORITY</label>
          <select id="priority" name="priority" defaultValue="1">
            <option value="1">1 - Easy</option>
            <option value="2">2 - Medium</option>
            <option value="3">3 - Urgent</option>
          </select>
        </div>
        <button type="submit" className="btn-craft" disabled={pending}>
          {pending ? '⏳ FORGING...' : '⚒️ FORGE QUEST'}
        </button>
      </form>
    </div>
  );
}
