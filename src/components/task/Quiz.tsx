import { useRef, useState } from 'react';
import { LEVEL_LABEL, LEVELS } from '../../data/quizzes';
import { type ByLevel, depthVerdict, gradeQuiz, isCorrect, shuffledOrder } from '../../data/quizzes/grading';
import type { QuizLevel, QuizQuestion } from '../../data/types';
import { QUIZ_PASS_RATIO, useProgress } from '../../store/progress';
import { Badge, Button, Card, Markdown } from '../ui';
import styles from './Quiz.module.css';

const LEVEL_COLOR: Record<QuizLevel, string> = {
  basic: 'var(--kind-read)',
  intermediate: 'var(--kind-code)',
  advanced: 'var(--kind-project)',
};

const TONE_COLOR = {
  deep: 'var(--done)',
  solid: 'var(--done)',
  working: 'var(--active)',
  review: 'var(--danger)',
} as const;

export function Quiz({ taskId, questions }: { taskId: string; questions: QuizQuestion[] }) {
  const [selections, setSelections] = useState<number[][]>(() => questions.map(() => []));
  const [checked, setChecked] = useState(false);
  // Options are reshuffled on every attempt; selections keep the original option indexes.
  const [orders, setOrders] = useState(() => questions.map((q) => shuffledOrder(q.options.length)));
  const resultRef = useRef<HTMLDivElement>(null);
  const saved = useProgress((s) => s.quizResults[taskId]);
  const done = useProgress((s) => Boolean(s.completed[taskId]));
  const recordQuiz = useProgress((s) => s.recordQuiz);
  const setDone = useProgress((s) => s.setDone);

  const answered = selections.filter((s) => s.length > 0).length;
  const grade = checked ? gradeQuiz(questions, selections) : null;
  const passed = grade ? grade.correct / grade.total >= QUIZ_PASS_RATIO : false;

  const select = (qi: number, oi: number) => {
    if (checked) return;
    setSelections((prev) =>
      prev.map((sel, i) => {
        if (i !== qi) return sel;
        if (questions[qi].answers.length === 1) return [oi];
        return sel.includes(oi) ? sel.filter((x) => x !== oi) : [...sel, oi];
      }),
    );
  };

  const check = () => {
    const result = gradeQuiz(questions, selections);
    recordQuiz(taskId, result.byLevel);
    setChecked(true);
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const retake = () => {
    setSelections(questions.map(() => []));
    setOrders(questions.map((q) => shuffledOrder(q.options.length)));
    setChecked(false);
  };

  const title = (
    <>
      Test · {questions.length} questions
      {saved && (
        <span style={{ marginLeft: 10, textTransform: 'none', letterSpacing: 0 }}>
          <Badge color={saved.best / saved.total >= QUIZ_PASS_RATIO ? 'var(--done)' : 'var(--active)'}>
            best {saved.best}/{saved.total}
          </Badge>
        </span>
      )}
    </>
  );

  let number = 0;
  return (
    <Card title={title}>
      <div ref={resultRef} />
      {grade ? (
        <QuizResult
          byLevel={grade.byLevel}
          correct={grade.correct}
          total={grade.total}
          passed={passed}
          onRetake={retake}
          onMarkRead={!done && passed ? () => setDone(taskId, true) : undefined}
        />
      ) : (
        <p className={styles.intro}>
          The questions go from basic definitions to edge cases and code output. Pass with{' '}
          {Math.round(QUIZ_PASS_RATIO * 100)}%. The advanced questions show how deep your understanding goes.
          {saved &&
            ` Last attempt: ${saved.last}/${saved.total} (${saved.attempts} attempt${saved.attempts > 1 ? 's' : ''}).`}
        </p>
      )}

      {LEVELS.map((level) => {
        const items = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.level === level);
        if (!items.length) return null;
        return (
          <section key={level}>
            <h3 className={styles.levelHeading}>
              <span style={{ color: LEVEL_COLOR[level] }}>●</span> {LEVEL_LABEL[level]}
            </h3>
            {items.map(({ q, i }) => {
              number += 1;
              return (
                <QuestionView
                  key={i}
                  number={number}
                  question={q}
                  selected={selections[i]}
                  order={orders[i]}
                  checked={checked}
                  onSelect={(oi) => select(i, oi)}
                />
              );
            })}
          </section>
        );
      })}

      <div className={styles.footer}>
        {checked ? (
          <>
            <span className="muted">
              {grade?.correct}/{grade?.total} correct
            </span>
            <span className={styles.spacer} />
            <Button onClick={retake}>Retake test</Button>
          </>
        ) : (
          <>
            <span className="muted">
              {answered}/{questions.length} answered
            </span>
            <span className={styles.spacer} />
            <Button variant="primary" disabled={answered < questions.length} onClick={check}>
              Check answers
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

function QuestionView({
  number,
  question,
  selected,
  order,
  checked,
  onSelect,
}: {
  number: number;
  question: QuizQuestion;
  selected: number[];
  order: number[];
  checked: boolean;
  onSelect: (option: number) => void;
}) {
  const multi = question.answers.length > 1;
  const correct = checked && isCorrect(question, selected);
  const name = `q-${number}`;

  return (
    <div className={[styles.question, checked && styles.locked].filter(Boolean).join(' ')}>
      <div className={styles.qHead}>
        <span className={styles.qNum}>{number}.</span>
        <div className={styles.qText}>
          <Markdown>{question.question}</Markdown>
          {multi && <span className={styles.multiHint}>Select all that apply ({question.answers.length} correct)</span>}
        </div>
        {checked && (
          <span className={styles.verdictTag} style={{ color: correct ? 'var(--done)' : 'var(--danger)' }}>
            {correct ? '✓ correct' : '✗ wrong'}
          </span>
        )}
      </div>
      <ul className={styles.options}>
        {order.map((oi) => {
          const option = question.options[oi];
          const isSelected = selected.includes(oi);
          const isAnswer = question.answers.includes(oi);
          const state = !checked
            ? undefined
            : isAnswer && isSelected
              ? styles.correct
              : isSelected
                ? styles.wrong
                : isAnswer
                  ? styles.missed
                  : undefined;
          return (
            <li key={oi}>
              <label className={[styles.option, multi ? styles.check : styles.radio, state].filter(Boolean).join(' ')}>
                <input
                  type={multi ? 'checkbox' : 'radio'}
                  name={name}
                  checked={isSelected}
                  disabled={checked}
                  onChange={() => onSelect(oi)}
                />
                <span className={styles.mark} aria-hidden />
                <span className={styles.optionText}>
                  <Markdown>{option}</Markdown>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {checked && (
        <div className={[styles.explanation, correct ? styles.explanationOk : styles.explanationBad].join(' ')}>
          <Markdown>{question.explanation}</Markdown>
        </div>
      )}
    </div>
  );
}

function QuizResult({
  byLevel,
  correct,
  total,
  passed,
  onRetake,
  onMarkRead,
}: {
  byLevel: ByLevel;
  correct: number;
  total: number;
  passed: boolean;
  onRetake: () => void;
  onMarkRead?: () => void;
}) {
  const depth = depthVerdict(byLevel);
  return (
    <div className={[styles.result, passed ? styles.resultPassed : styles.resultFailed].join(' ')}>
      <div className={styles.resultHead}>
        <span className={styles.score}>
          {correct}/{total}
        </span>
        <span className="muted">{Math.round((correct / total) * 100)}%</span>
        <span className={styles.verdict} style={{ color: TONE_COLOR[depth.tone] }}>
          {depth.label}
        </span>
        <Badge color={passed ? 'var(--done)' : 'var(--active)'}>
          {passed ? 'passed' : `not passed · need ${Math.round(QUIZ_PASS_RATIO * 100)}%`}
        </Badge>
      </div>
      <p className={styles.verdictText}>{depth.text}</p>
      <div className={styles.levels}>
        {LEVELS.map((level) => {
          const s = byLevel[level];
          if (!s) return null;
          const pct = Math.round((s.correct / s.total) * 100);
          return (
            <div key={level} className={styles.levelRow}>
              <span>{LEVEL_LABEL[level]}</span>
              <div className={styles.levelBar}>
                <div className={styles.levelFill} style={{ width: `${pct}%`, background: LEVEL_COLOR[level] }} />
              </div>
              <span className={styles.levelNum}>
                {s.correct}/{s.total}
              </span>
            </div>
          );
        })}
      </div>
      <div className={styles.footer}>
        <span className="muted">Scroll down to see an explanation for every question.</span>
        <span className={styles.spacer} />
        {onMarkRead && (
          <Button variant="primary" onClick={onMarkRead}>
            Mark as read
          </Button>
        )}
        <Button onClick={onRetake}>Retake</Button>
      </div>
    </div>
  );
}
