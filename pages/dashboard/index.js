import { useState } from "react";
import Head from "next/head";
import * as cookie from "cookie";
import session from "models/session.js";
import user from "models/user.js";
import task from "models/task.js";
import category from "models/category.js";
import authorization from "models/authorization.js";
import date from "infra/date.js";
import FlowerIcon from "components/icons/FlowerIcon";
import DashboardHeader from "components/dashboard/DashboardHeader";
import AgendaCard from "components/dashboard/AgendaCard";
import CategoryProgressCard from "components/dashboard/CategoryProgressCard";
import WeekAgendaCard from "components/dashboard/WeekAgendaCard";
import TaskModal from "components/dashboard/TaskModal";
import TaskCreatedPopup from "components/dashboard/TaskCreatedPopup";
import CategoriesModal from "components/dashboard/CategoriesModal";
import styles from "./Dashboard.module.css";

export async function getServerSideProps({ req }) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const sessionToken = cookies.session_id;

  if (!sessionToken) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  try {
    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userObject = await user.findOneById(sessionObject.user_id);

    const today = date.getTodayInBrazil();
    const tasksFound = await task.findAllByUserIdAndDate(userObject.id, today);
    const categoriesFound = await category.findAllByUserId(userObject.id);

    return {
      props: {
        username: userObject.username,
        today,
        initialTasks: authorization.filterOutput(
          userObject,
          "read:task",
          tasksFound,
        ),
        initialCategories: authorization.filterOutput(
          userObject,
          "read:category",
          categoriesFound,
        ),
      },
    };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
}

export default function DashboardPage({
  username,
  today,
  initialTasks,
  initialCategories,
}) {
  const [selectedDate, setSelectedDate] = useState(today);
  const [tasks, setTasks] = useState(initialTasks);
  const [categories, setCategories] = useState(initialCategories);
  const [taskBeingEdited, setTaskBeingEdited] = useState(null);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isCreatedPopupOpen, setCreatedPopupOpen] = useState(false);
  const [isCategoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [isLoadingDay, setLoadingDay] = useState(false);
  const [tasksVersion, setTasksVersion] = useState(0);

  async function fetchTasksForDate(dateString) {
    const response = await fetch(`/api/v1/tasks?date=${dateString}`);

    if (!response.ok) {
      throw new Error("Não foi possível carregar as tarefas.");
    }

    return await response.json();
  }

  async function handleSelectDate(nextDate) {
    if (nextDate === selectedDate) return;

    setLoadingDay(true);

    try {
      const nextTasks = await fetchTasksForDate(nextDate);
      setSelectedDate(nextDate);
      setTasks(nextTasks);
    } catch {
      // Mantém o dia atual visível caso a busca falhe.
    } finally {
      setLoadingDay(false);
    }
  }

  async function handleToggleTask(taskToToggle) {
    const nextCompleted = !taskToToggle.completed_at;

    setTasks((previous) =>
      previous.map((item) =>
        item.id === taskToToggle.id
          ? {
              ...item,
              completed_at: nextCompleted ? new Date().toISOString() : null,
            }
          : item,
      ),
    );

    try {
      const response = await fetch(`/api/v1/tasks/${taskToToggle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextCompleted }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTask = await response.json();
      setTasks((previous) =>
        previous.map((item) =>
          item.id === updatedTask.id ? updatedTask : item,
        ),
      );
      setTasksVersion((previous) => previous + 1);
    } catch {
      setTasks((previous) =>
        previous.map((item) =>
          item.id === taskToToggle.id ? taskToToggle : item,
        ),
      );
    }
  }

  async function handleSubmitTask(payload) {
    const response = taskBeingEdited
      ? await fetch(`/api/v1/tasks/${taskBeingEdited.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/v1/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (!response.ok) {
      const body = await response.json();
      throw new Error(body.message || "Não foi possível salvar a tarefa.");
    }

    // Se a tarefa foi salva para outro dia, leva a agenda até ela.
    const targetDate = payload.date || selectedDate;
    const refreshedTasks = await fetchTasksForDate(targetDate);

    setSelectedDate(targetDate);
    setTasks(refreshedTasks);
    setTasksVersion((previous) => previous + 1);

    if (!taskBeingEdited) {
      setCreatedPopupOpen(true);
    }
  }

  async function handleDeleteTask(taskToDelete) {
    const response = await fetch(`/api/v1/tasks/${taskToDelete.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = await response.json();
      throw new Error(body.message || "Não foi possível excluir a tarefa.");
    }

    setTasks((previous) =>
      previous.filter((item) => item.id !== taskToDelete.id),
    );
    setTasksVersion((previous) => previous + 1);
  }

  function handleOpenNewTask() {
    setTaskBeingEdited(null);
    setTaskModalOpen(true);
  }

  function handleEditTask(taskToEdit) {
    setTaskBeingEdited(taskToEdit);
    setTaskModalOpen(true);
  }

  function handleCloseTaskModal() {
    setTaskModalOpen(false);
    setTaskBeingEdited(null);
  }

  function handleCreateCategory(newCategory) {
    setCategories((previous) => [...previous, newCategory]);
  }

  async function handleUpdateCategory(categoryToUpdate, values) {
    const response = await fetch(`/api/v1/categories/${categoryToUpdate.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const body = await response.json();
      throw new Error(body.message || "Não foi possível salvar a categoria.");
    }

    const updatedCategory = await response.json();
    setCategories((previous) =>
      previous.map((item) =>
        item.id === updatedCategory.id ? updatedCategory : item,
      ),
    );
  }

  async function handleDeleteCategory(categoryToDelete) {
    const response = await fetch(`/api/v1/categories/${categoryToDelete.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = await response.json();
      throw new Error(body.message || "Não foi possível excluir a categoria.");
    }

    setCategories((previous) =>
      previous.filter((item) => item.id !== categoryToDelete.id),
    );

    // As tarefas que usavam a categoria ficam sem categoria.
    setTasks((previous) =>
      previous.map((item) =>
        item.category_id === categoryToDelete.id
          ? { ...item, category_id: null }
          : item,
      ),
    );
    setTasksVersion((previous) => previous + 1);
  }

  async function handleLogout() {
    await fetch("/api/v1/sessions", { method: "DELETE" });
    window.location.href = "/login";
  }

  return (
    <div className={styles.page}>
      <Head>
        <title>Bloomy</title>
      </Head>

      <header className={styles.topBar}>
        <div className={styles.brand}>
          <FlowerIcon size={32} color="var(--color-primary)" />
          <span>Bloomy</span>
        </div>
        <button className={styles.logout} onClick={handleLogout}>
          Sair
        </button>
      </header>

      <main className={styles.content}>
        <DashboardHeader
          formattedDate={date.formatFullDate(selectedDate)}
          username={username}
          selectedDate={selectedDate}
          today={today}
          onSelectDate={handleSelectDate}
          onAddClick={handleOpenNewTask}
          isLoadingDay={isLoadingDay}
        />

        <div className={styles.cards}>
          <AgendaCard
            tasks={tasks}
            categories={categories}
            onToggleTask={handleToggleTask}
            onEditTask={handleEditTask}
          />

          <div className={styles.categoryCell}>
            <CategoryProgressCard
              tasks={tasks}
              categories={categories}
              onOpenCategories={() => setCategoriesModalOpen(true)}
            />
          </div>
        </div>

        <WeekAgendaCard
          anchorDate={today}
          today={today}
          categories={categories}
          refreshToken={tasksVersion}
        />
      </main>

      {isTaskModalOpen && (
        <TaskModal
          task={taskBeingEdited}
          defaultDate={selectedDate}
          categories={categories}
          onClose={handleCloseTaskModal}
          onSubmit={handleSubmitTask}
          onDelete={handleDeleteTask}
          onCreateCategory={handleCreateCategory}
        />
      )}

      {isCategoriesModalOpen && (
        <CategoriesModal
          categories={categories}
          onClose={() => setCategoriesModalOpen(false)}
          onUpdate={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
      )}

      {isCreatedPopupOpen && (
        <TaskCreatedPopup onClose={() => setCreatedPopupOpen(false)} />
      )}
    </div>
  );
}
