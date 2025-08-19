<template>
  <div class="rating-component">
    <!-- Display Mode -->
    <div v-if="!interactive" class="rating-display">
      <div class="stars-container">
        <span
          v-for="star in 5"
          :key="star"
          class="star"
          :class="{ filled: star <= Math.round(averageRating) }"
        >
          ★
        </span>
      </div>
      <div class="rating-info">
        <span class="average-score">{{ averageRating.toFixed(1) }}</span>
        <span class="total-ratings"
          >({{ totalRatings }} {{ totalRatings === 1 ? 'rating' : 'ratings' }})</span
        >
      </div>
    </div>

    <!-- Interactive Mode -->
    <div v-else class="rating-interactive">
      <div class="user-rating mb-2">
        <div class="stars-container">
          <span
            v-for="star in 5"
            :key="star"
            class="star rating-star"
            :class="{
              filled: star <= (hoverRating || userRating),
              hoverable: !hasUserRated,
            }"
            @mouseenter="!hasUserRated && setHoverRating(star)"
            @mouseleave="!hasUserRated && clearHoverRating()"
            @click="!hasUserRated && setRating(star)"
          >
            ★
          </span>
        </div>
      </div>

      <div class="rating-actions" v-if="!hasUserRated">
        <div class="action-buttons">
          <button v-if="userRating > 0" @click="submitRating" class="btn btn-sm btn-primary me-2">
            {{ 'Submit' }}
          </button>
          <button
            v-if="userRating > 0"
            @click="clearRating"
            class="btn btn-sm btn-outline-secondary"
          >
            {{ 'Clear' }}
          </button>
        </div>
      </div>

      <div v-else class="user-rated-feedback">
        <small class="text-success">
          {{ 'You rated this' }} {{ currentRatings.userRatings[currentUser.username] }}
          {{ 'stars' }}
        </small>
      </div>

      <!-- Display current average -->
      <div class="current-average mt-2">
        <small class="text-muted">
          {{ 'Average:' }} {{ averageRating.toFixed(1) }} ({{ totalRatings }}
          {{ totalRatings === 1 ? 'rating' : 'ratings' }})
        </small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  targetId: {
    type: [String, Number],
    required: true,
  },
  targetType: {
    type: String,
    required: true, // 'resource', 'post', 'info', etc.
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  currentUser: {
    type: Object,
    default: () => ({ username: 'Guest' }),
  },
})

// Emits
const emit = defineEmits(['rating-submitted'])

const userRating = ref(0)
const hoverRating = ref(0)

const ratingsStore = ref({
  resources: {
    1: { ratings: [5, 4, 5, 4, 5], userRatings: {} },
    2: { ratings: [4, 3, 4, 4, 5], userRatings: {} },
    3: { ratings: [5, 5, 4, 5, 4], userRatings: {} },
    4: { ratings: [3, 4, 4, 3, 5], userRatings: {} },
    5: { ratings: [4, 4, 5, 4, 4], userRatings: {} },
  },
  posts: {
    1: { ratings: [5, 4, 5], userRatings: {} },
    2: { ratings: [4, 4, 5, 5], userRatings: {} },
    3: { ratings: [3, 4, 4], userRatings: {} },
    4: { ratings: [5, 5, 4, 5], userRatings: {} },
  },
  info: {
    vaccines: { ratings: [5, 4, 5, 4, 5, 4], userRatings: {} },
    medicalExam: { ratings: [4, 4, 5, 4, 5], userRatings: {} },
    emergency: { ratings: [5, 5, 5, 4, 5], userRatings: {} },
  },
})

const initializeRatings = () => {
  if (!ratingsStore.value[props.targetType]) {
    ratingsStore.value[props.targetType] = {}
  }
  if (!ratingsStore.value[props.targetType][props.targetId]) {
    ratingsStore.value[props.targetType][props.targetId] = {
      ratings: [],
      userRatings: {},
    }
  }
}
const currentRatings = computed(() => {
  return ratingsStore.value[props.targetType]?.[props.targetId] || { ratings: [], userRatings: {} }
})

const averageRating = computed(() => {
  const ratings = currentRatings.value.ratings
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((acc, rating) => acc + rating, 0)
  return sum / ratings.length
})

const totalRatings = computed(() => {
  return currentRatings.value.ratings.length
})

const hasUserRated = computed(() => {
  return !!currentRatings.value.userRatings[props.currentUser.username]
})

const setRating = (rating) => {
  if (props.interactive && !hasUserRated.value) {
    userRating.value = rating
  }
}

const setHoverRating = (rating) => {
  hoverRating.value = rating
}

const clearHoverRating = () => {
  hoverRating.value = 0
}

const clearRating = () => {
  userRating.value = 0
}

const submitRating = () => {
  if (userRating.value > 0 && !hasUserRated.value) {
    currentRatings.value.ratings.push(userRating.value)
    currentRatings.value.userRatings[props.currentUser.username] = userRating.value

    emit('rating-submitted', {
      targetId: props.targetId,
      targetType: props.targetType,
      rating: userRating.value,
      newAverage: averageRating.value,
      totalRatings: totalRatings.value,
    })

    userRating.value = 0
  }
}
watch(
  [() => props.targetType, () => props.targetId, () => props.currentUser.username],
  () => {
    initializeRatings()
    if (hasUserRated.value) {
      userRating.value = currentRatings.value.userRatings[props.currentUser.username]
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.rating-component {
  display: inline-block;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-interactive {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.user-rating {
  display: flex;
  align-items: center;
}

.stars-container {
  display: flex;
  gap: 0.2rem;
}

.star {
  font-size: 1.5rem; /* Adjust as needed */
  cursor: pointer;
  transition: all 0.2s ease;
  color: #e9ecef; /* Default empty star color */
}

.star:hover {
  transform: scale(1.1);
}

.star.filled {
  color: #ffc107; /* Filled star color */
}

.star.hoverable {
  color: #ffeb3b; /* Hover color */
}

.rating-info {
  font-weight: 500;
  color: #495057;
}

.average-score {
  font-size: 1.25rem;
  font-weight: bold;
}

.total-ratings {
  font-size: 0.875rem;
  color: #6c757d;
}

.rating-actions {
  margin-top: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.user-rated-feedback {
  margin-top: 1rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .rating-interactive {
    padding: 0.75rem;
  }

  .user-rating {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
