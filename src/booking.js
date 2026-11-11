import "./booking.css";

const SERVICES = [
  "Avaliação odontológica",
  "Implantes dentários",
  "Ortodontia",
  "Odontopediatria",
  "Clareamento dental",
  "Laserterapia",
  "Estética facial",
];

const TIMES = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00",
];

const STORAGE_KEY = "tradicao-agendamentos-demo-v1";

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function readBookings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

let bookings = readBookings();

const dialog = document.createElement("dialog");
dialog.className = "booking";
dialog.setAttribute("aria-labelledby", "booking-title");

dialog.innerHTML = `
  <div class="booking__shell">
    <button
      class="booking__close"
      type="button"
      aria-label="Fechar agendamento"
    >×</button>

    <div class="booking__intro">
      <span class="booking__eyebrow">TRADIÇÃO ODONTOLOGIA</span>

      <h2 id="booking-title">
        Seu cuidado<br />
        <em>começa aqui.</em>
      </h2>

      <p>Escolha o atendimento e encontre um horário para você.</p>

      <div class="booking__notice">
        Demonstração: horários simulados.
        Nenhuma consulta real será marcada.
      </div>
    </div>

    <form class="booking__form">
      <label class="booking__field">
        <span>Qual atendimento você procura?</span>
        <select name="service" required>
          <option value="">Selecione o serviço</option>
          ${SERVICES.map(
            (service) => `<option value="${service}">${service}</option>`
          ).join("")}
        </select>
      </label>

      <label class="booking__field">
        <span>Qual dia fica melhor?</span>
        <input type="date" name="date" required />
      </label>

      <fieldset class="booking__availability">
        <legend>Horários disponíveis</legend>
        <p class="booking__status" role="status"></p>
        <div class="booking__times"></div>
      </fieldset>

      <p class="booking__error" role="alert"></p>

      <button class="booking__submit" type="submit" disabled>
        Simular agendamento <span aria-hidden="true">→</span>
      </button>

      <p class="booking__footnote">
        Nesta demonstração, cada horário representa uma consulta
        de 30 minutos em uma agenda única.
      </p>
    </form>

    <div class="booking__success" hidden>
      <span class="booking__check" aria-hidden="true">✓</span>
      <h3>Simulação concluída!</h3>
      <p class="booking__summary"></p>
      <p>
        O horário foi reservado apenas nesta demonstração,
        neste navegador. A clínica não recebeu um agendamento.
      </p>
      <button type="button" class="booking__again">
        Simular outro horário
      </button>
    </div>
  </div>
`;

document.body.appendChild(dialog);

const form = dialog.querySelector("form");
const serviceInput = form.elements.service;
const dateInput = form.elements.date;
const timesContainer = dialog.querySelector(".booking__times");
const status = dialog.querySelector(".booking__status");
const error = dialog.querySelector(".booking__error");
const submit = dialog.querySelector(".booking__submit");
const success = dialog.querySelector(".booking__success");
const summary = dialog.querySelector(".booking__summary");

let selectedTime = "";
let opener = null;

function updateDateLimits() {
  const today = new Date();
  const lastDay = new Date(today);
  lastDay.setDate(lastDay.getDate() + 60);

  dateInput.min = dateKey(today);
  dateInput.max = dateKey(lastDay);
}

/*
 * Disponibilidade simulada.
 * Depois substituímos esta função por uma consulta ao sistema da clínica.
 */
function availableTimes(day) {
  const date = new Date(`${day}T12:00:00`);
  const weekday = date.getDay();

  if (weekday === 0) return [];

  const dailyTimes =
    weekday === 6
      ? TIMES.filter((time) => time < "12:00")
      : TIMES;

  const now = new Date();

  return dailyTimes.map((time, index) => {
    const startsAt = new Date(`${day}T${time}:00`);

    // Alguns horários ocupados para demonstrar a experiência.
    const simulatedBusy = (date.getDate() + index) % 5 === 0;

    const alreadyBooked = bookings.some(
      (booking) => booking.day === day && booking.time === time
    );

    return {
      time,
      available:
        !simulatedBusy &&
        !alreadyBooked &&
        startsAt > now,
    };
  });
}

function renderTimes() {
  selectedTime = "";
  submit.disabled = true;
  timesContainer.replaceChildren();
  error.textContent = "";

  updateDateLimits();

  if (!serviceInput.value || !dateInput.value) {
    status.textContent = "Selecione o serviço e o dia para ver os horários.";
    return;
  }

  if (
    !dateInput.validity.valid ||
    dateInput.value < dateInput.min ||
    dateInput.value > dateInput.max
  ) {
    status.textContent = "Escolha uma data válida nos próximos 60 dias.";
    return;
  }

  const slots = availableTimes(dateInput.value);

  if (!slots.length) {
    status.textContent = "Não há atendimento neste dia. Escolha outra data.";
    return;
  }

  const free = slots.filter((slot) => slot.available).length;

  status.textContent = free
    ? `${free} horários disponíveis. Os horários apagados estão indisponíveis.`
    : "Todos os horários estão indisponíveis. Experimente outro dia.";

  slots.forEach(({ time, available }) => {
    const label = document.createElement("label");
    label.className = "booking__slot";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "time";
    input.value = time;
    input.required = true;
    input.disabled = !available;

    const text = document.createElement("span");
    text.textContent = time;

    input.setAttribute(
      "aria-label",
      available ? time : `${time}, indisponível`
    );

    input.addEventListener("change", () => {
      selectedTime = time;
      submit.disabled = false;
      error.textContent = "";
    });

    label.append(input, text);
    timesContainer.appendChild(label);
  });
}

function showForm() {
  success.hidden = true;
  form.hidden = false;
  renderTimes();
}

function openBooking(event) {
  event.preventDefault();

  // Evita que o link também navegue até #contato.
  event.stopPropagation();

  opener = event.currentTarget;

  form.reset();
  showForm();

  if (!dialog.open) {
    dialog.showModal();
    document.documentElement.classList.add("booking-open");
  }
}

function closeBooking() {
  dialog.close();
}

const triggers = document.querySelectorAll(
  ".hero__actions .button--glass, .services__cta, .service-card__schedule"
);

triggers.forEach((trigger) => {
  trigger.addEventListener("click", openBooking);
});

dialog.querySelector(".booking__close")
  .addEventListener("click", closeBooking);

dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;

  const bounds = dialog.getBoundingClientRect();

  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  ) {
    closeBooking();
  }
});

dialog.addEventListener("close", () => {
  document.documentElement.classList.remove("booking-open");
  opener?.focus({ preventScroll: true });
});

serviceInput.addEventListener("change", renderTimes);
dateInput.addEventListener("change", renderTimes);

dialog.querySelector(".booking__again").addEventListener("click", () => {
  showForm();
  serviceInput.focus();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  updateDateLimits();

  if (!form.reportValidity() || !selectedTime) return;

  // Atualiza as reservas salvas em outra aba deste navegador.
  const saved = readBookings();
  const merged = new Map(
    [...bookings, ...saved].map((booking) => [
      `${booking.day}|${booking.time}`,
      booking,
    ])
  );
  bookings = [...merged.values()];

  const slot = availableTimes(dateInput.value).find(
    (item) => item.time === selectedTime
  );

  if (!slot?.available) {
    renderTimes();
    error.textContent = "Esse horário não está mais disponível. Escolha outro.";
    return;
  }

  const booking = {
    service: serviceInput.value,
    day: dateInput.value,
    time: selectedTime,
  };

  bookings.push(booking);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    // Se o navegador bloquear o armazenamento, vale só nesta página.
  }

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${booking.day}T12:00:00`));

  summary.textContent =
    `${booking.service} — ${formattedDate}, às ${booking.time}.`;

  form.hidden = true;
  success.hidden = false;
  dialog.querySelector(".booking__again").focus();
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    triggers.forEach((trigger) => {
      trigger.removeEventListener("click", openBooking);
    });

    document.documentElement.classList.remove("booking-open");
    dialog.remove();
  });
}