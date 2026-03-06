const modeButtons = Array.from(document.querySelectorAll(".segmented__btn"));
const sidebarScreenButtons = Array.from(document.querySelectorAll(".task-nav__item"));
const projectEntryButton = document.querySelector(".project-entry__btn");
const screenButtons = projectEntryButton ? [...sidebarScreenButtons, projectEntryButton] : sidebarScreenButtons;
const screens = Array.from(document.querySelectorAll(".screen"));

const roleSelect = document.getElementById("roleSelect");
const publishBtn = document.getElementById("publishBtn");
const draftBanner = document.getElementById("draftBanner");
const viewPill = document.getElementById("viewPill");
const modePill = document.getElementById("modePill");
const statusPill = document.getElementById("statusPill");
const autosavePill = document.getElementById("autosavePill");
const projectPill = document.getElementById("projectPill");
const breadcrumbText = document.getElementById("breadcrumbText");

const presenceBar = document.getElementById("presenceBar");
const projectCards = Array.from(document.querySelectorAll(".project-card"));
const openProjectButtons = Array.from(document.querySelectorAll(".open-project-btn"));

const contextCards = Array.from(document.querySelectorAll(".context-card"));
const architectOnlyBlocks = Array.from(document.querySelectorAll(".architect-only"));
const contextToolbar = document.getElementById("contextToolbar");
const selectedStandDetail = document.getElementById("selectedStandDetail");
const commentThreadList = document.getElementById("commentThreadList");

const editorLayout = document.getElementById("editorLayout");
const leftPanel = document.getElementById("leftPanel");
const rightPanel = document.getElementById("rightPanel");
const collapseButtons = Array.from(document.querySelectorAll(".dock-toggle"));

const canvasViewport = document.getElementById("canvasViewport");
const canvasStage = document.getElementById("canvasStage");
const canvas = document.getElementById("canvas");
const stands = Array.from(document.querySelectorAll(".stand"));
const selectableNodes = Array.from(document.querySelectorAll(".selectable"));
const focusChangeButtons = Array.from(document.querySelectorAll(".focus-change"));

const minimap = document.getElementById("minimap");
const minimapWorld = document.getElementById("minimapWorld");
const minimapViewport = document.getElementById("minimapViewport");

const hierarchySearch = document.getElementById("hierarchySearch");
const treeNodes = Array.from(document.querySelectorAll("#treeWrapper details[data-node-id]"));
const treeStandItems = Array.from(document.querySelectorAll(".tree-stand"));

const smartStandSearch = document.getElementById("smartStandSearch");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");

const layerToggles = Array.from(document.querySelectorAll(".layer-toggle"));
const layerElements = Array.from(document.querySelectorAll("[data-layer-kind]"));

const filterCommercial = document.getElementById("filterCommercial");
const filterWorkflow = document.getElementById("filterWorkflow");
const filterIsland = document.getElementById("filterIsland");
const filterExhibitor = document.getElementById("filterExhibitor");
const filterSizeMin = document.getElementById("filterSizeMin");
const filterSizeMax = document.getElementById("filterSizeMax");
const filterPriceMin = document.getElementById("filterPriceMin");
const filterPriceMax = document.getElementById("filterPriceMax");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const activeFilterChips = document.getElementById("activeFilterChips");

const compareOverlayBtn = document.getElementById("compareOverlayBtn");
const compareSplitBtn = document.getElementById("compareSplitBtn");

const multiSelectBtn = document.getElementById("multiSelectBtn");
const createGroupBtn = document.getElementById("createGroupBtn");
const addCommentBtn = document.getElementById("addCommentBtn");
const commentMarkers = document.getElementById("commentMarkers");

const metricTotal = document.getElementById("metricTotal");
const metricSold = document.getElementById("metricSold");
const metricReserved = document.getElementById("metricReserved");
const metricAvailable = document.getElementById("metricAvailable");
const metricRevenue = document.getElementById("metricRevenue");

const requestList = document.getElementById("requestList");
const requestSort = document.getElementById("requestSort");
const requestStatusFilter = document.getElementById("requestStatusFilter");
const requestGroupBy = document.getElementById("requestGroupBy");

const storageKeys = {
	collapsed: "plan-ui-collapsed-panels",
	tree: "plan-ui-tree-collapsed",
	layers: "plan-ui-layer-prefs",
	camera: "plan-ui-camera",
};

const state = {
	mode: "publicado",
	selectedStandId: null,
	camera: { x: 0, y: 0, zoom: 1 },
	dragging: false,
	dragStart: { x: 0, y: 0 },
	multiSelect: false,
	selectedForGroup: new Set(),
	comments: [],
	autosave: {
		lastSavedAt: null,
		intervalId: null,
		tickerId: null,
		isSaving: false,
	},
	filters: {},
};

const modeMap = {
	publicado: {
		view: "Vista: Publicado",
		mode: "Modo: Lectura",
		status: "Estado: Publicado",
		showDraftBanner: false,
	},
	borrador: {
		view: "Vista: Publicado",
		mode: "Modo: Mi borrador",
		status: "Estado: Pendiente de aprobación",
		showDraftBanner: true,
	},
	comparar: {
		view: "Vista: Comparar",
		mode: "Modo: Revisión de cambios",
		status: "Estado: Con conflictos",
		showDraftBanner: false,
	},
};

const collaborators = [
	{ name: "Marta Ruiz", initials: "MR" },
	{ name: "Laura Gómez", initials: "LG" },
	{ name: "Pablo Díaz", initials: "PD" },
	{ name: "Ana Vela", initials: "AV" },
];

function setProject(projectName, breadcrumb) {
	projectPill.textContent = `Proyecto: ${projectName}`;
	breadcrumbText.textContent = breadcrumb;
	projectCards.forEach((card) => {
		card.classList.toggle("is-current", card.dataset.projectName === projectName);
	});
}

function setMode(mode) {
	const values = modeMap[mode];
	if (!values) return;
	state.mode = mode;

	modeButtons.forEach((btn) => {
		btn.classList.toggle("is-active", btn.dataset.mode === mode);
	});

	viewPill.textContent = values.view;
	modePill.textContent = values.mode;
	statusPill.textContent = values.status;
	draftBanner.hidden = !values.showDraftBanner;

	if (mode === "comparar") {
		canvas.classList.add("compare-overlay");
	} else {
		canvas.classList.remove("compare-overlay", "compare-split");
		compareOverlayBtn.classList.add("is-active");
		compareSplitBtn.classList.remove("is-active");
	}

	manageAutosaveLoop();
}

function setScreen(screen) {
	sidebarScreenButtons.forEach((btn) => {
		btn.classList.toggle("is-active", btn.dataset.screen === screen);
	});
	if (projectEntryButton) {
		projectEntryButton.classList.toggle("is-active", screen === "proyectos");
	}
	screens.forEach((section) => {
		section.classList.toggle("is-visible", section.id === `screen-${screen}`);
	});
}

function setRole(role) {
	const isArchitect = role === "arquitecto";
	publishBtn.disabled = !isArchitect;
	document.body.classList.toggle("architect-mode", isArchitect);
	architectOnlyBlocks.forEach((block) => {
		block.hidden = !isArchitect;
	});
	contextToolbar.dataset.role = role;
}

function setContext(type) {
	contextCards.forEach((card) => {
		card.hidden = card.dataset.context !== type;
	});
}

function renderPresence() {
	if (!presenceBar) return;
	const maxVisible = 3;
	const visible = collaborators.slice(0, maxVisible);
	const remaining = Math.max(0, collaborators.length - maxVisible);
	presenceBar.innerHTML = visible
		.map((user) => `<span class="avatar" title="${user.name}">${user.initials}</span>`)
		.join("")
		.concat(remaining ? `<span class="avatar avatar--more" title="${remaining} usuarios más">+${remaining}</span>` : "");
	presenceBar.title = `Activos: ${collaborators.map((person) => person.name).join(", ")}`;
}

function updateAutosavePill(status, text) {
	autosavePill.textContent = `Autosave: ${text}`;
	autosavePill.classList.remove("pill--saving", "pill--saved", "pill--offline");
	autosavePill.classList.add(status);
}

function runAutosave() {
	if (state.mode !== "borrador") return;
	if (!navigator.onLine) {
		updateAutosavePill("pill--offline", "Conexión perdida");
		return;
	}
	state.autosave.isSaving = true;
	updateAutosavePill("pill--saving", "Saving…");
	window.setTimeout(() => {
		state.autosave.isSaving = false;
		state.autosave.lastSavedAt = Date.now();
		updateAutosavePill("pill--saved", "Saved just now");
	}, 700);
}

function refreshAutosaveAge() {
	if (state.mode !== "borrador") {
		updateAutosavePill("", "No activo");
		return;
	}
	if (!navigator.onLine) {
		updateAutosavePill("pill--offline", "Connection lost");
		return;
	}
	if (state.autosave.isSaving) {
		updateAutosavePill("pill--saving", "Saving…");
		return;
	}
	if (!state.autosave.lastSavedAt) {
		updateAutosavePill("pill--saving", "Pendiente");
		return;
	}
	const seconds = Math.floor((Date.now() - state.autosave.lastSavedAt) / 1000);
	if (seconds <= 1) {
		updateAutosavePill("pill--saved", "Saved just now");
	} else {
		updateAutosavePill("pill--saved", `Saved ${seconds}s ago`);
	}
}

function manageAutosaveLoop() {
	window.clearInterval(state.autosave.intervalId);
	window.clearInterval(state.autosave.tickerId);
	if (state.mode === "borrador") {
		refreshAutosaveAge();
		state.autosave.intervalId = window.setInterval(runAutosave, 5000);
		state.autosave.tickerId = window.setInterval(refreshAutosaveAge, 1000);
	} else {
		refreshAutosaveAge();
	}
}

function applyPanelState() {
	const persisted = JSON.parse(localStorage.getItem(storageKeys.collapsed) || "{}");
	editorLayout.classList.toggle("left-collapsed", Boolean(persisted.left));
	editorLayout.classList.toggle("right-collapsed", Boolean(persisted.right));
	leftPanel.hidden = Boolean(persisted.left);
	rightPanel.hidden = Boolean(persisted.right);
	window.setTimeout(updateMinimapViewport, 80);
}

function togglePanel(side) {
	const persisted = JSON.parse(localStorage.getItem(storageKeys.collapsed) || "{}");
	persisted[side] = !persisted[side];
	localStorage.setItem(storageKeys.collapsed, JSON.stringify(persisted));
	applyPanelState();
}

function saveTreeState() {
	const collapsed = treeNodes.filter((node) => !node.open).map((node) => node.dataset.nodeId);
	localStorage.setItem(storageKeys.tree, JSON.stringify(collapsed));
}

function loadTreeState() {
	const collapsed = new Set(JSON.parse(localStorage.getItem(storageKeys.tree) || "[]"));
	treeNodes.forEach((node) => {
		node.open = !collapsed.has(node.dataset.nodeId);
	});
}

function autoExpandTree() {
	const selectedTree = treeStandItems.find((item) => item.dataset.standId === state.selectedStandId);
	if (!selectedTree) return;
	let parent = selectedTree.parentElement;
	while (parent) {
		if (parent.tagName === "DETAILS") parent.open = true;
		parent = parent.parentElement;
	}
	saveTreeState();
}

function setSelectedStand(standId) {
	state.selectedStandId = standId;
	stands.forEach((stand) => {
		stand.classList.toggle("is-selected", stand.dataset.standId === standId);
	});
	treeStandItems.forEach((item) => {
		item.classList.toggle("is-selected", item.dataset.standId === standId);
	});

	const stand = stands.find((item) => item.dataset.standId === standId);
	if (!stand) {
		setContext("none");
		selectedStandDetail.innerHTML = "";
		return;
	}
	setContext(stand.dataset.selection || "stand");
	selectedStandDetail.innerHTML = `
		<li><span>ID</span><strong>${stand.dataset.standId}</strong></li>
		<li><span>Estado comercial</span><strong>${stand.dataset.commercial}</strong></li>
		<li><span>Workflow</span><strong>${stand.dataset.workflow}</strong></li>
		<li><span>Superficie</span><strong>${stand.dataset.size} m²</strong></li>
		<li><span>Expositor</span><strong>${stand.dataset.exhibitor}</strong></li>
		<li><span>Precio</span><strong>${Number(stand.dataset.price).toLocaleString("es-ES")} €</strong></li>
	`;
	autoExpandTree();
}

function applyCamera() {
	canvasStage.style.transform = `translate(${state.camera.x}px, ${state.camera.y}px) scale(${state.camera.zoom})`;
	localStorage.setItem(storageKeys.camera, JSON.stringify(state.camera));
	updateMinimapViewport();
}

function clampZoom(zoom) {
	return Math.min(2.5, Math.max(0.45, zoom));
}

function zoom(delta, centerX = 0, centerY = 0) {
	const previousZoom = state.camera.zoom;
	const nextZoom = clampZoom(previousZoom + delta);
	if (nextZoom === previousZoom) return;
	const factor = nextZoom / previousZoom;
	state.camera.x = centerX - (centerX - state.camera.x) * factor;
	state.camera.y = centerY - (centerY - state.camera.y) * factor;
	state.camera.zoom = nextZoom;
	applyCamera();
}

function animateCamera(targetX, targetY, targetZoom = state.camera.zoom) {
	const start = { ...state.camera };
	const startTime = performance.now();
	const duration = 380;

	function tick(now) {
		const t = Math.min(1, (now - startTime) / duration);
		const eased = 1 - (1 - t) ** 3;
		state.camera.x = start.x + (targetX - start.x) * eased;
		state.camera.y = start.y + (targetY - start.y) * eased;
		state.camera.zoom = start.zoom + (targetZoom - start.zoom) * eased;
		applyCamera();
		if (t < 1) requestAnimationFrame(tick);
	}

	requestAnimationFrame(tick);
}

function focusStand(standId) {
	const stand = stands.find((item) => item.dataset.standId === standId);
	if (!stand) return;
	setSelectedStand(standId);

	const viewportRect = canvasViewport.getBoundingClientRect();
	const standRect = stand.getBoundingClientRect();
	const standCenterX = standRect.left + standRect.width / 2;
	const standCenterY = standRect.top + standRect.height / 2;
	const dx = viewportRect.width / 2 - (standCenterX - viewportRect.left);
	const dy = viewportRect.height / 2 - (standCenterY - viewportRect.top);
	animateCamera(state.camera.x + dx, state.camera.y + dy, Math.max(state.camera.zoom, 1.1));

	stand.classList.add("is-focused");
	window.setTimeout(() => stand.classList.remove("is-focused"), 1200);
}

function buildMinimap() {
	minimapWorld.innerHTML = stands
		.map((stand) => `<span class="mini-stand" style="left:${stand.style.left};top:${stand.style.top};"></span>`)
		.join("");
	updateMinimapViewport();
}

function updateMinimapViewport() {
	const worldRect = canvas.getBoundingClientRect();
	const viewRect = canvasViewport.getBoundingClientRect();
	if (!worldRect.width || !worldRect.height) return;
	const scaleX = minimap.clientWidth / worldRect.width;
	const scaleY = minimap.clientHeight / worldRect.height;

	const viewportWidth = Math.min(minimap.clientWidth, viewRect.width * scaleX / state.camera.zoom);
	const viewportHeight = Math.min(minimap.clientHeight, viewRect.height * scaleY / state.camera.zoom);
	const viewportLeft = Math.min(
		Math.max(0, (-state.camera.x / state.camera.zoom) * scaleX),
		Math.max(0, minimap.clientWidth - viewportWidth)
	);
	const viewportTop = Math.min(
		Math.max(0, (-state.camera.y / state.camera.zoom) * scaleY),
		Math.max(0, minimap.clientHeight - viewportHeight)
	);

	minimapViewport.style.width = `${viewportWidth}px`;
	minimapViewport.style.height = `${viewportHeight}px`;
	minimapViewport.style.left = `${viewportLeft}px`;
	minimapViewport.style.top = `${viewportTop}px`;
}

function applyLayerPrefs() {
	const prefs = JSON.parse(localStorage.getItem(storageKeys.layers) || "{}");
	layerToggles.forEach((toggle) => {
		const value = prefs[toggle.dataset.layer];
		if (typeof value === "boolean") toggle.checked = value;
	});

	const hiddenLayers = new Set(
		layerToggles.filter((toggle) => !toggle.checked).map((toggle) => toggle.dataset.layer)
	);

	layerElements.forEach((el) => {
		const kind = el.dataset.layerKind;
		el.hidden = hiddenLayers.has(kind);
		if (kind === "workflow" && hiddenLayers.has("workflow")) {
			el.classList.add("wf-hidden");
		} else if (kind === "workflow") {
			el.classList.remove("wf-hidden");
		}
		if (kind === "commercial" && hiddenLayers.has("commercial")) {
			el.classList.add("commercial-hidden");
		} else if (kind === "commercial") {
			el.classList.remove("commercial-hidden");
		}
	});
}

function persistLayerPrefs() {
	const prefs = {};
	layerToggles.forEach((toggle) => {
		prefs[toggle.dataset.layer] = toggle.checked;
	});
	localStorage.setItem(storageKeys.layers, JSON.stringify(prefs));
	applyLayerPrefs();
}

function getActiveFilters() {
	return {
		commercial: filterCommercial.value,
		workflow: filterWorkflow.value,
		island: filterIsland.value,
		exhibitor: filterExhibitor.value.trim().toLowerCase(),
		sizeMin: Number(filterSizeMin.value) || null,
		sizeMax: Number(filterSizeMax.value) || null,
		priceMin: Number(filterPriceMin.value) || null,
		priceMax: Number(filterPriceMax.value) || null,
	};
}

function filterMatches(stand, filters) {
	if (filters.commercial && stand.dataset.commercial !== filters.commercial) return false;
	if (filters.workflow && stand.dataset.workflow !== filters.workflow) return false;
	if (filters.island && stand.dataset.island !== filters.island) return false;
	if (filters.exhibitor && !stand.dataset.exhibitor.toLowerCase().includes(filters.exhibitor)) return false;
	const size = Number(stand.dataset.size);
	const price = Number(stand.dataset.price);
	if (filters.sizeMin && size < filters.sizeMin) return false;
	if (filters.sizeMax && size > filters.sizeMax) return false;
	if (filters.priceMin && price < filters.priceMin) return false;
	if (filters.priceMax && price > filters.priceMax) return false;
	return true;
}

function renderFilterChips(filters) {
	const entries = Object.entries(filters).filter(([, value]) => value !== "" && value !== null);
	activeFilterChips.innerHTML = entries
		.map(([key, value]) => `<span class="chip chip--active">${key}: ${value}</span>`)
		.join("");
}

function applyFilters() {
	const filters = getActiveFilters();
	state.filters = filters;
	stands.forEach((stand) => {
		stand.classList.toggle("is-filtered-out", !filterMatches(stand, filters));
	});
	renderFilterChips(filters);
	updateAnalytics();
}

function resetFilters() {
	filterCommercial.value = "";
	filterWorkflow.value = "";
	filterIsland.value = "";
	filterExhibitor.value = "";
	filterSizeMin.value = "";
	filterSizeMax.value = "";
	filterPriceMin.value = "";
	filterPriceMax.value = "";
	applyFilters();
}

function runSmartSearch(query) {
	const term = query.trim().toLowerCase();
	let firstMatch = null;
	stands.forEach((stand) => {
		const target = `${stand.dataset.standId} ${stand.dataset.exhibitor} ${stand.dataset.commercial} ${stand.dataset.size}`.toLowerCase();
		const matched = term && target.includes(term);
		stand.classList.toggle("is-search-hit", matched);
		if (!firstMatch && matched) firstMatch = stand;
	});
	if (firstMatch) {
		focusStand(firstMatch.dataset.standId);
	}
}

function updateAnalytics() {
	const visibleStands = stands.filter((stand) => !stand.classList.contains("is-filtered-out"));
	const totals = visibleStands.reduce(
		(acc, stand) => {
			const size = Number(stand.dataset.size);
			const price = Number(stand.dataset.price);
			acc.total += size;
			acc.revenue += price;
			if (stand.dataset.commercial === "vendido") acc.sold += size;
			if (stand.dataset.commercial === "reservado") acc.reserved += size;
			if (stand.dataset.commercial === "disponible") acc.available += size;
			return acc;
		},
		{ total: 0, sold: 0, reserved: 0, available: 0, revenue: 0 }
	);
	metricTotal.textContent = `${totals.total} m²`;
	metricSold.textContent = `${totals.sold} m²`;
	metricReserved.textContent = `${totals.reserved} m²`;
	metricAvailable.textContent = `${totals.available} m²`;
	metricRevenue.textContent = `${totals.revenue.toLocaleString("es-ES")} €`;
}

function renderComments() {
	commentMarkers.innerHTML = "";
	commentThreadList.innerHTML = "";
	state.comments.forEach((comment, index) => {
		const stand = stands.find((item) => item.dataset.standId === comment.standId);
		if (!stand) return;
		const marker = document.createElement("button");
		marker.className = "comment-marker";
		marker.textContent = "💬";
		marker.style.left = stand.style.left;
		marker.style.top = stand.style.top;
		marker.title = `${comment.author}: ${comment.text}`;
		marker.addEventListener("click", () => focusStand(comment.standId));
		commentMarkers.appendChild(marker);

		const li = document.createElement("li");
		li.innerHTML = `<strong>${comment.standId}</strong> · ${comment.author}: ${comment.text} <button data-resolve="${index}" class="link-btn">Resolver</button>`;
		commentThreadList.appendChild(li);
	});
}

function sortAndFilterRequests() {
	if (!requestList) return;
	const items = Array.from(requestList.querySelectorAll(".request-item"));
	const status = requestStatusFilter.value;
	let filtered = items;
	items.forEach((item) => {
		item.hidden = Boolean(status) && item.dataset.status !== status;
	});
	filtered = items.filter((item) => !item.hidden);

	const sortBy = requestSort.value;
	filtered.sort((a, b) => {
		if (sortBy === "date") return b.dataset.date.localeCompare(a.dataset.date);
		if (sortBy === "changes") return Number(b.dataset.changes) - Number(a.dataset.changes);
		return Number(b.dataset.priority) - Number(a.dataset.priority);
	});

	filtered.forEach((item) => requestList.appendChild(item));

	const groupBy = requestGroupBy.value;
	Array.from(requestList.querySelectorAll(".request-group")).forEach((group) => group.remove());
	if (groupBy !== "none") {
		let current = "";
		filtered.forEach((item) => {
			const value = item.dataset[groupBy];
			if (value !== current) {
				current = value;
				const divider = document.createElement("li");
				divider.className = "request-group";
				divider.textContent = `${groupBy}: ${value}`;
				requestList.insertBefore(divider, item);
			}
		});
	}
}

function saveCamera() {
	localStorage.setItem(storageKeys.camera, JSON.stringify(state.camera));
}

function loadCamera() {
	const persisted = JSON.parse(localStorage.getItem(storageKeys.camera) || "null");
	if (!persisted) return;
	state.camera = {
		x: Number(persisted.x) || 0,
		y: Number(persisted.y) || 0,
		zoom: clampZoom(Number(persisted.zoom) || 1),
	};
	applyCamera();
}

modeButtons.forEach((button) => {
	button.addEventListener("click", () => setMode(button.dataset.mode));
});

screenButtons.forEach((button) => {
	button.addEventListener("click", () => setScreen(button.dataset.screen));
});

roleSelect.addEventListener("change", (event) => {
	setRole(event.target.value);
});

openProjectButtons.forEach((button) => {
	button.addEventListener("click", () => {
		setProject(button.dataset.projectName, button.dataset.projectBreadcrumb);
		setScreen("plano");
	});
});

collapseButtons.forEach((button) => {
	button.addEventListener("click", () => togglePanel(button.dataset.collapse));
});

selectableNodes.forEach((node) => {
	node.addEventListener("click", () => {
		if (!node.classList.contains("stand")) return;
		const standId = node.dataset.standId;
		if (state.multiSelect) {
			if (state.selectedForGroup.has(standId)) {
				state.selectedForGroup.delete(standId);
				node.classList.remove("is-group-selected");
			} else {
				state.selectedForGroup.add(standId);
				node.classList.add("is-group-selected");
			}
			return;
		}
		setSelectedStand(standId);
	});
});

focusChangeButtons.forEach((button) => {
	button.addEventListener("click", () => focusStand(button.dataset.focusId));
});

treeNodes.forEach((node) => {
	node.addEventListener("toggle", saveTreeState);
});

treeStandItems.forEach((item) => {
	item.addEventListener("click", () => focusStand(item.dataset.standId));
});

hierarchySearch.addEventListener("input", (event) => {
	const term = event.target.value.trim().toLowerCase();
	treeStandItems.forEach((item) => {
		const matched = item.dataset.standId.toLowerCase().includes(term);
		item.hidden = term.length > 0 && !matched;
	});
});

smartStandSearch.addEventListener("input", (event) => runSmartSearch(event.target.value));

layerToggles.forEach((toggle) => {
	toggle.addEventListener("change", persistLayerPrefs);
});

[
	filterCommercial,
	filterWorkflow,
	filterIsland,
	filterExhibitor,
	filterSizeMin,
	filterSizeMax,
	filterPriceMin,
	filterPriceMax,
].forEach((input) => {
	input.addEventListener("input", applyFilters);
	input.addEventListener("change", applyFilters);
});

resetFiltersBtn.addEventListener("click", resetFilters);

zoomInBtn.addEventListener("click", () => zoom(0.1, canvasViewport.clientWidth / 2, canvasViewport.clientHeight / 2));
zoomOutBtn.addEventListener("click", () => zoom(-0.1, canvasViewport.clientWidth / 2, canvasViewport.clientHeight / 2));

canvasViewport.addEventListener("wheel", (event) => {
	event.preventDefault();
	const rect = canvasViewport.getBoundingClientRect();
	zoom(event.deltaY < 0 ? 0.08 : -0.08, event.clientX - rect.left, event.clientY - rect.top);
});

canvasViewport.addEventListener("mousedown", (event) => {
	if (event.button !== 0) return;
	state.dragging = true;
	state.dragStart.x = event.clientX;
	state.dragStart.y = event.clientY;
	canvasViewport.classList.add("is-panning");
});

document.addEventListener("mousemove", (event) => {
	if (!state.dragging) return;
	state.camera.x += event.clientX - state.dragStart.x;
	state.camera.y += event.clientY - state.dragStart.y;
	state.dragStart.x = event.clientX;
	state.dragStart.y = event.clientY;
	applyCamera();
});

document.addEventListener("mouseup", () => {
	if (!state.dragging) return;
	state.dragging = false;
	canvasViewport.classList.remove("is-panning");
	saveCamera();
});

minimap.addEventListener("click", (event) => {
	const rect = minimap.getBoundingClientRect();
	const relativeX = (event.clientX - rect.left) / rect.width;
	const relativeY = (event.clientY - rect.top) / rect.height;
	const world = canvas.getBoundingClientRect();
	const targetX = -(relativeX * world.width) * state.camera.zoom + canvasViewport.clientWidth / 2;
	const targetY = -(relativeY * world.height) * state.camera.zoom + canvasViewport.clientHeight / 2;
	animateCamera(targetX, targetY, state.camera.zoom);
});

window.addEventListener("resize", updateMinimapViewport);

compareOverlayBtn.addEventListener("click", () => {
	compareOverlayBtn.classList.add("is-active");
	compareSplitBtn.classList.remove("is-active");
	canvas.classList.remove("compare-split");
	canvas.classList.add("compare-overlay");
});

compareSplitBtn.addEventListener("click", () => {
	compareSplitBtn.classList.add("is-active");
	compareOverlayBtn.classList.remove("is-active");
	canvas.classList.add("compare-split");
});

multiSelectBtn.addEventListener("click", () => {
	state.multiSelect = !state.multiSelect;
	multiSelectBtn.classList.toggle("is-active", state.multiSelect);
	if (!state.multiSelect) {
		state.selectedForGroup.clear();
		stands.forEach((stand) => stand.classList.remove("is-group-selected"));
	}
});

createGroupBtn.addEventListener("click", () => {
	if (state.selectedForGroup.size < 2) return;
	const groupName = window.prompt("Nombre del grupo de stands", "Nueva zona");
	if (!groupName) return;
	const selected = stands.filter((stand) => state.selectedForGroup.has(stand.dataset.standId));
	if (!selected.length) return;
	const avgTop = selected.reduce((sum, stand) => sum + Number.parseFloat(stand.style.top), 0) / selected.length;
	const avgLeft = selected.reduce((sum, stand) => sum + Number.parseFloat(stand.style.left), 0) / selected.length;
	const label = document.createElement("div");
	label.className = "group-label";
	label.dataset.layerKind = "stands";
	label.dataset.group = groupName;
	label.style.top = `${Math.max(4, avgTop - 6)}%`;
	label.style.left = `${avgLeft}%`;
	label.textContent = groupName;
	canvasStage.appendChild(label);
	state.selectedForGroup.clear();
	stands.forEach((stand) => stand.classList.remove("is-group-selected"));
	state.multiSelect = false;
	multiSelectBtn.classList.remove("is-active");
});

addCommentBtn.addEventListener("click", () => {
	if (!state.selectedStandId) return;
	const text = window.prompt("Escribe un comentario (puedes mencionar con @nombre)");
	if (!text) return;
	state.comments.push({
		standId: state.selectedStandId,
		author: "Tú",
		text,
		createdAt: Date.now(),
	});
	renderComments();
});

commentThreadList.addEventListener("click", (event) => {
	const target = event.target;
	if (!(target instanceof HTMLElement)) return;
	const index = target.dataset.resolve;
	if (typeof index === "undefined") return;
	state.comments.splice(Number(index), 1);
	renderComments();
});

if (requestSort && requestStatusFilter && requestGroupBy) {
	requestSort.addEventListener("change", sortAndFilterRequests);
	requestStatusFilter.addEventListener("change", sortAndFilterRequests);
	requestGroupBy.addEventListener("change", sortAndFilterRequests);
}

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		setSelectedStand(null);
		stands.forEach((stand) => {
			stand.classList.remove("is-group-selected", "is-search-hit");
		});
		setContext("none");
	}
});

window.addEventListener("offline", refreshAutosaveAge);
window.addEventListener("online", refreshAutosaveAge);

renderPresence();
setMode("publicado");
setRole(roleSelect.value);
setScreen("plano");
setContext("none");
setProject("Expo Madrid 2026", "Evento Expo 2026 / Recinto Norte / Pabellón A / Planta 1");
loadTreeState();
applyPanelState();
applyLayerPrefs();
applyFilters();
updateAnalytics();
loadCamera();
buildMinimap();
sortAndFilterRequests();
refreshAutosaveAge();
