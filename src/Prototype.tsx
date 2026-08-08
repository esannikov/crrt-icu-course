import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronRightIcon,
  Cross2Icon,
  ExternalLinkIcon,
  ReaderIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import "@fontsource-variable/manrope/index.css";
import "@fontsource-variable/ibm-plex-sans/index.css";
import {
  buildCaseModule,
  commonModules,
  patients,
  sources,
  type CourseModule,
  type LearningCard,
  type Patient,
} from "./courseData";

type Screen = "patients" | "home" | "course" | "sources" | "results";
type Answers = Record<string, number>;

const ANSWERS_KEY = "crrt-course-answers-v1";
const PATIENT_KEY = "crrt-course-patient-v1";

function safeStoredAnswers(): Answers {
  try {
    const value = localStorage.getItem(ANSWERS_KEY);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

export default function Prototype() {
  const storedPatient = localStorage.getItem(PATIENT_KEY);
  const [patientId, setPatientId] = useState<string | null>(storedPatient);
  const [answers, setAnswers] = useState<Answers>(safeStoredAnswers);
  const [screen, setScreen] = useState<Screen>(storedPatient ? "home" : "patients");
  const [moduleIndex, setModuleIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [resetPending, setResetPending] = useState(false);

  const patient = patients.find((item) => item.id === patientId) ?? patients[0];
  const modules = useMemo(() => [...commonModules, buildCaseModule(patient)], [patient]);
  const allCards = useMemo(() => modules.flatMap((module) => module.cards), [modules]);
  const answeredCount = allCards.filter((card) => answers[card.id] !== undefined).length;
  const correctCount = allCards.filter((card) => answers[card.id] === card.correct).length;
  const percent = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;

  useEffect(() => {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  }, [answers]);

  const choosePatient = (nextId: string) => {
    setPatientId(nextId);
    localStorage.setItem(PATIENT_KEY, nextId);
    setAnswers((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith("m8-"))));
    setScreen("home");
    setModuleIndex(0);
    setCardIndex(0);
  };

  const openModule = (index: number, targetCard?: number) => {
    setModuleIndex(index);
    if (targetCard !== undefined) {
      setCardIndex(targetCard);
    } else {
      const firstOpen = modules[index].cards.findIndex((card) => answers[card.id] === undefined);
      setCardIndex(firstOpen === -1 ? 0 : firstOpen);
    }
    setScreen("course");
  };

  const submitAnswer = (card: LearningCard, selected: number) => {
    if (answers[card.id] !== undefined) return;
    setAnswers((current) => ({ ...current, [card.id]: selected }));
  };

  const nextCard = () => {
    const module = modules[moduleIndex];
    if (cardIndex < module.cards.length - 1) {
      setCardIndex((value) => value + 1);
      return;
    }
    if (moduleIndex < modules.length - 1) {
      setScreen("home");
      return;
    }
    setScreen("results");
  };

  const reviewFirstError = () => {
    for (let mi = 0; mi < modules.length; mi += 1) {
      const ci = modules[mi].cards.findIndex((card) => answers[card.id] !== undefined && answers[card.id] !== card.correct);
      if (ci >= 0) {
        openModule(mi, ci);
        return;
      }
    }
  };

  const resetCourse = () => {
    setAnswers({});
    setResetPending(false);
    setModuleIndex(0);
    setCardIndex(0);
    setScreen("home");
  };

  const requestResetCourse = () => {
    if (answeredCount === 0) return;
    if (window.confirm("Очистити всі відповіді? Обраний пацієнт залишиться.")) resetCourse();
  };

  return (
    <div className="app-screen">
      {screen === "patients" && <PatientChooser onChoose={choosePatient} />}
      {screen === "home" && (
        <HomeScreen
          patient={patient}
          modules={modules}
          answers={answers}
          answeredCount={answeredCount}
          correctCount={correctCount}
          onOpenModule={openModule}
          onChangePatient={() => setScreen("patients")}
          onSources={() => setScreen("sources")}
          onResults={() => setScreen("results")}
          onReset={requestResetCourse}
        />
      )}
      {screen === "course" && (
        <CourseScreen
          module={modules[moduleIndex]}
          moduleIndex={moduleIndex}
          cardIndex={cardIndex}
          answer={answers[modules[moduleIndex].cards[cardIndex].id]}
          onAnswer={(selected) => submitAnswer(modules[moduleIndex].cards[cardIndex], selected)}
          onBack={() => setScreen("home")}
          onNext={nextCard}
          canReset={answeredCount > 0}
          onReset={requestResetCourse}
        />
      )}
      {screen === "sources" && <SourcesScreen onBack={() => setScreen("home")} />}
      {screen === "results" && (
        <ResultsScreen
          modules={modules}
          answers={answers}
          correctCount={correctCount}
          answeredCount={answeredCount}
          percent={percent}
          resetPending={resetPending}
          onBack={() => setScreen("home")}
          onReview={reviewFirstError}
          onResetAsk={() => setResetPending(true)}
          onResetCancel={() => setResetPending(false)}
          onReset={resetCourse}
        />
      )}
    </div>
  );
}

function PatientChooser({ onChoose }: { onChoose: (id: string) => void }) {
  return (
    <main className="screen-content patient-screen" data-testid="patient-chooser">
      <header className="intro-header">
        <span className="kicker">Особистий мінікурс · дорослі</span>
        <h1>Оберіть пацієнта</h1>
        <p>Один із п’яти синтетичних випадків супроводжуватиме вас через курс і стане основою фінального модуля.</p>
      </header>
      <div className="patient-list">
        {patients.map((patient, index) => (
          <button className="patient-choice" key={patient.id} onClick={() => onChoose(patient.id)} data-testid={"patient-" + patient.id}>
            <span className="patient-number">0{index + 1}</span>
            <span className="patient-choice-copy">
              <strong>{patient.shortName}</strong>
              <span>{patient.title}</span>
              <small>{patient.profile}</small>
            </span>
            <ChevronRightIcon aria-hidden />
          </button>
        ))}
      </div>
      <aside className="education-note">
        <ReaderIcon aria-hidden />
        <p><strong>Навчальний матеріал.</strong> Усі випадки вигадані. Курс не замінює локальний протокол, інструкцію апарата або рішення старшого лікаря й нефролога.</p>
      </aside>
    </main>
  );
}

function HomeScreen({
  patient,
  modules,
  answers,
  answeredCount,
  correctCount,
  onOpenModule,
  onChangePatient,
  onSources,
  onResults,
  onReset,
}: {
  patient: Patient;
  modules: CourseModule[];
  answers: Answers;
  answeredCount: number;
  correctCount: number;
  onOpenModule: (index: number) => void;
  onChangePatient: () => void;
  onSources: () => void;
  onResults: () => void;
  onReset: () => void;
}) {
  return (
    <main className="screen-content home-screen" data-testid="home-screen">
      <header className="course-header">
        <div className="course-header-top">
          <span className="kicker">Замісна ниркова терапія у ВІТ</span>
          <button className="course-reset-button" onClick={onReset} disabled={answeredCount === 0} aria-label="Скинути поточний результат" title="Скинути поточний результат">
            <ReloadIcon aria-hidden /><span>Скинути</span>
          </button>
        </div>
        <h1>Від рішення<br />до моніторингу</h1>
        <div className="overall-progress" aria-label={answeredCount + " із 80 карток пройдено"}>
          <span style={{ width: String((answeredCount / 80) * 100) + "%" }} />
        </div>
        <div className="progress-copy">
          <strong>{answeredCount}<small>/80</small></strong>
          <span>{correctCount} правильних відповідей</span>
        </div>
      </header>

      <section className="selected-patient">
        <div>
          <span>Ваш випадок</span>
          <strong>{patient.shortName}</strong>
          <p>{patient.title} · {patient.signal}</p>
        </div>
        <button onClick={onChangePatient}>Змінити</button>
      </section>

      <section className="module-section">
        <div className="section-heading"><span>8 модулів</span><strong>Навчальний маршрут</strong></div>
        <div className="module-list">
          {modules.map((module, index) => {
            const done = module.cards.filter((card) => answers[card.id] !== undefined).length;
            return (
              <button className="module-row" onClick={() => onOpenModule(index)} key={module.id} data-testid={"module-" + module.id}>
                <span className="module-index">{String(module.id).padStart(2, "0")}</span>
                <span className="module-copy">
                  <small>{module.eyebrow}</small>
                  <strong>{module.title}</strong>
                  <span>{module.summary}</span>
                </span>
                <span className={"module-count " + (done === 10 ? "is-complete" : "")}>
                  {done === 10 ? <CheckIcon aria-label="Завершено" /> : done + "/10"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <nav className="home-actions" aria-label="Додаткові дії">
        <button onClick={onSources}><ReaderIcon /> Джерела й межі</button>
        <button onClick={onResults} disabled={answeredCount === 0}>Поточний результат <ChevronRightIcon /></button>
      </nav>
      <p className="review-date">Матеріал переглянуто 6 серпня 2026 року</p>
    </main>
  );
}

function CourseScreen({
  module,
  moduleIndex,
  cardIndex,
  answer,
  onAnswer,
  onBack,
  onNext,
  canReset,
  onReset,
}: {
  module: CourseModule;
  moduleIndex: number;
  cardIndex: number;
  answer: number | undefined;
  onAnswer: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
  canReset: boolean;
  onReset: () => void;
}) {
  const card = module.cards[cardIndex];
  const answered = answer !== undefined;
  const isCorrect = answer === card.correct;
  const source = sources[card.sourceIds[0]];
  return (
    <main className="screen-content course-screen" data-testid="course-screen">
      <div className="course-screen-actions">
        <button className="back-button" onClick={onBack} aria-label="Повернутися до модулів"><ArrowLeftIcon /></button>
        <button className="course-reset-button" onClick={onReset} disabled={!canReset} aria-label="Скинути поточний результат" title="Скинути поточний результат">
          <ReloadIcon aria-hidden /><span>Скинути</span>
        </button>
      </div>
      <header className="lesson-header">
        <span className="lesson-course">Замісна ниркова терапія у ВІТ</span>
        <div className="lesson-title"><strong>Модуль {moduleIndex + 1}</strong><span>·</span><span>{module.title}</span></div>
      </header>
      <div className="lesson-progress">
        <span className="lesson-fraction"><strong>{cardIndex + 1}</strong> / 10</span>
        <div className="progress-dots" aria-hidden>
          {module.cards.map((item, index) => <i key={item.id} className={index <= cardIndex ? "is-active" : ""} />)}
        </div>
      </div>

      {card.context && <p className="case-context">{card.context}</p>}
      <section className="question-block">
        <span className="question-kind">{card.kind}</span>
        <h1>{card.prompt}</h1>
      </section>

      <div className="decision-list" role="group" aria-label="Варіанти відповіді">
        {card.options.map((option, index) => {
          const isChosen = answer === index;
          const isRight = answered && index === card.correct;
          const isWrong = answered && isChosen && !isRight;
          return (
            <button
              key={option}
              className={"decision-option " + (isRight ? "is-right " : "") + (isWrong ? "is-wrong" : "")}
              onClick={() => onAnswer(index)}
              disabled={answered}
              aria-pressed={isChosen}
            >
              <span className="decision-node">{isRight ? <CheckIcon /> : isWrong ? <Cross2Icon /> : index + 1}</span>
              <span>{option}</span>
              {isRight && <small>Правильно</small>}
            </button>
          );
        })}
      </div>

      {answered && (
        <section className={"feedback " + (isCorrect ? "is-correct" : "is-incorrect")} aria-live="polite" data-testid="answer-feedback">
          <div className="feedback-label">{isCorrect ? <><CheckIcon /> Правильно</> : <><Cross2Icon /> Правильна відповідь показана вище</>}</div>
          <p>{card.explanation}</p>
          <blockquote>{card.pearl}</blockquote>
          <a className="source-inline" href={source.url} target="_blank" rel="noreferrer">{source.short} · {source.year} <ExternalLinkIcon /></a>
        </section>
      )}

      <button className="primary-action" onClick={onNext} disabled={!answered} data-testid="next-card">
        {cardIndex === 9 && moduleIndex === 7 ? "Показати результат" : cardIndex === 9 ? "До модулів" : "Наступна картка"}
        <ChevronRightIcon />
      </button>
    </main>
  );
}

function SourcesScreen({ onBack }: { onBack: () => void }) {
  return (
    <main className="screen-content sources-screen" data-testid="sources-screen">
      <button className="back-button" onClick={onBack} aria-label="Назад"><ArrowLeftIcon /></button>
      <header className="intro-header compact">
        <span className="kicker">Прозорість</span>
        <h1>Джерела й межі</h1>
        <p>Картки стисло переказують джерела. Локальний протокол, характеристики апарата та рішення клінічної команди мають пріоритет.</p>
      </header>
      <div className="source-list">
        {Object.entries(sources).map(([id, source], index) => (
          <a key={id} href={source.url} target="_blank" rel="noreferrer">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><strong>{source.title}</strong><small>{source.year}</small></div>
            <ExternalLinkIcon />
          </a>
        ))}
      </div>
      <aside className="education-note">
        <ReaderIcon />
        <p><strong>Важлива межа.</strong> Курс не навчає самостійно запускати конкретний апарат, призначати антикоагуляцію або змінювати параметри без нагляду.</p>
      </aside>
    </main>
  );
}

function ResultsScreen({
  modules,
  answers,
  correctCount,
  answeredCount,
  percent,
  resetPending,
  onBack,
  onReview,
  onResetAsk,
  onResetCancel,
  onReset,
}: {
  modules: CourseModule[];
  answers: Answers;
  correctCount: number;
  answeredCount: number;
  percent: number;
  resetPending: boolean;
  onBack: () => void;
  onReview: () => void;
  onResetAsk: () => void;
  onResetCancel: () => void;
  onReset: () => void;
}) {
  const completed = answeredCount === 80;
  const cards = modules.flatMap((module) => module.cards);
  const wrongCount = Object.entries(answers).filter(([id, selected]) => {
    const card = cards.find((item) => item.id === id);
    return card && selected !== card.correct;
  }).length;
  const label = !completed ? "Курс ще триває" : percent >= 85 ? "Впевнена база" : percent >= 70 ? "Добрий фундамент" : "Потрібне повторення";
  return (
    <main className="screen-content results-screen" data-testid="results-screen">
      <button className="back-button" onClick={onBack} aria-label="Назад"><ArrowLeftIcon /></button>
      <header className="result-hero">
        <span className="kicker">Підсумок</span>
        <h1>{label}</h1>
        <div className="score-line"><strong>{correctCount}</strong><span>/ {answeredCount || 80}</span></div>
        <p>{completed ? percent + "% правильних відповідей у восьми модулях." : "Відповіді дано на " + answeredCount + " із 80 карток."}</p>
      </header>
      <section className="result-modules">
        {modules.map((module) => {
          const answered = module.cards.filter((card) => answers[card.id] !== undefined).length;
          const correct = module.cards.filter((card) => answers[card.id] === card.correct).length;
          return <div key={module.id}><span>0{module.id}</span><strong>{module.title}</strong><small>{correct}/{answered || 10}</small></div>;
        })}
      </section>
      {wrongCount > 0 && <button className="primary-action" onClick={onReview}>Переглянути помилки <ChevronRightIcon /></button>}
      {!resetPending ? (
        <button className="secondary-action" onClick={onResetAsk}><ReloadIcon /> Почати курс спочатку</button>
      ) : (
        <div className="reset-confirm">
          <p>Очистити всі відповіді? Обраний пацієнт залишиться.</p>
          <div><button onClick={onResetCancel}>Скасувати</button><button onClick={onReset}>Очистити</button></div>
        </div>
      )}
      <p className="result-note">Результат відображає проходження навчальних карток і не є підтвердженням клінічної компетентності.</p>
    </main>
  );
}
