// src/utils/gpsFilter.js

// ============================================================
// GeoGuard GPS Filter
// ============================================================
//
// This file is responsible for filtering GPS noise before
// coordinates are displayed on the GeoGuard map.
//
// NEO-M8N GPS can produce slightly different coordinates even
// when the device is completely stationary.
//
// Example:
//
// Actual:
//      X
//
// GPS:
//
//      •
//   •  X  •
//      •
//
// Those small movements should NOT become a route on the map.
//
// ============================================================

// ============================================================
// CONSTANTS
// ============================================================

const EARTH_RADIUS_METERS = 6371000;

// ============================================================
// GPS CONFIGURATION
// ============================================================

export const GPS_CONFIG = {
  // Device must move at least 100m before
  // a new tracking point is added.
  MIN_MOVEMENT_METERS: 80,

  // Reject extremely large GPS jumps.
  MAX_JUMP_METERS: 150,

  // Confirmation distance.
  CONFIRMATION_DISTANCE_METERS: 15,

  // Keep only points within 500m of current location.
  MAX_RADIUS_METERS: 500,

  // Maximum points rendered on map.
  MAX_TRACK_POINTS: 300,

  // Remove historical points closer than 100m.
  TRAIL_MIN_DISTANCE_METERS: 80,
};

// ============================================================
// VALID GPS POINT
// ============================================================

export const isValidGpsPoint = (point) => {
  if (!Array.isArray(point) || point.length < 2) {
    return false;
  }

  const latitude = Number(point[0]);
  const longitude = Number(point[1]);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

// ============================================================
// VALID LOCATION OBJECT
// ============================================================

export const isValidLocation = (location) => {
  if (!location) {
    return false;
  }

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

// ============================================================
// DEGREE -> RADIAN
// ============================================================

const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

// ============================================================
// HAVERSINE DISTANCE
// ============================================================

export const distanceBetweenPoints = (pointA, pointB) => {
  if (!isValidGpsPoint(pointA) || !isValidGpsPoint(pointB)) {
    return Infinity;
  }

  const lat1 = toRadians(Number(pointA[0]));
  const lon1 = toRadians(Number(pointA[1]));

  const lat2 = toRadians(Number(pointB[0]));
  const lon2 = toRadians(Number(pointB[1]));

  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  const safeA = Math.min(1, Math.max(0, a));

  const c = 2 * Math.asin(Math.sqrt(safeA));

  return EARTH_RADIUS_METERS * c;
};

// ============================================================
// LOCATION -> POINT
// ============================================================

export const locationToPoint = (location) => {
  if (!isValidLocation(location)) {
    return null;
  }

  return [Number(location.latitude), Number(location.longitude)];
};

// ============================================================
// DISTANCE FROM LOCATION
// ============================================================

export const distanceFromLocation = (location, point) => {
  const locationPoint = locationToPoint(location);

  if (!locationPoint) {
    return Infinity;
  }

  return distanceBetweenPoints(locationPoint, point);
};

// ============================================================
// KEEP POINTS WITHIN RADIUS
// ============================================================

export const filterPointsWithinRadius = (
  points,
  center,
  radiusMeters = GPS_CONFIG.MAX_RADIUS_METERS,
) => {
  if (!Array.isArray(points) || !isValidLocation(center)) {
    return [];
  }

  const centerPoint = locationToPoint(center);

  return points.filter((point) => {
    if (!isValidGpsPoint(point)) {
      return false;
    }

    const distance = distanceBetweenPoints(centerPoint, point);

    return distance <= radiusMeters;
  });
};

// ============================================================
// THIN TRAIL
// ============================================================
//
// Removes points that are too close to the previously
// accepted route point.
//
// ============================================================

export const thinTrail = (
  points,
  minimumDistanceMeters = GPS_CONFIG.TRAIL_MIN_DISTANCE_METERS,
) => {
  if (!Array.isArray(points)) {
    return [];
  }

  const validPoints = points.filter(isValidGpsPoint);

  if (validPoints.length <= 1) {
    return validPoints;
  }

  const result = [validPoints[0]];

  for (let i = 1; i < validPoints.length; i++) {
    const current = validPoints[i];

    const previous = result[result.length - 1];

    const distance = distanceBetweenPoints(previous, current);

    if (distance >= minimumDistanceMeters) {
      result.push(current);
    }
  }

  return result;
};

// ============================================================
// LIMIT POINT COUNT
// ============================================================

export const limitTrackPoints = (
  points,
  maximumPoints = GPS_CONFIG.MAX_TRACK_POINTS,
) => {
  if (!Array.isArray(points)) {
    return [];
  }

  return points.filter(isValidGpsPoint).slice(-maximumPoints);
};

// ============================================================
// PROCESS HISTORICAL TRACK
// ============================================================

export const processTrackPoints = (points, currentLocation, options = {}) => {
  const {
    radiusMeters = GPS_CONFIG.MAX_RADIUS_METERS,

    minimumDistanceMeters = GPS_CONFIG.TRAIL_MIN_DISTANCE_METERS,

    maximumPoints = GPS_CONFIG.MAX_TRACK_POINTS,
  } = options;

  if (!isValidLocation(currentLocation)) {
    return [];
  }

  let processed = Array.isArray(points) ? points.filter(isValidGpsPoint) : [];

  // ----------------------------------------------------------
  // 500m radius
  // ----------------------------------------------------------

  processed = filterPointsWithinRadius(
    processed,
    currentLocation,
    radiusMeters,
  );

  // ----------------------------------------------------------
  // Remove closely spaced points
  // ----------------------------------------------------------

  processed = thinTrail(processed, minimumDistanceMeters);

  // ----------------------------------------------------------
  // Limit points
  // ----------------------------------------------------------

  processed = limitTrackPoints(processed, maximumPoints);

  return processed;
};

// ============================================================
// EVALUATE MOVEMENT
// ============================================================

export const evaluateMovement = (previousPoint, newPoint, options = {}) => {
  const {
    minimumDistanceMeters = GPS_CONFIG.MIN_MOVEMENT_METERS,

    maximumJumpMeters = GPS_CONFIG.MAX_JUMP_METERS,
  } = options;

  // ----------------------------------------------------------
  // Invalid point
  // ----------------------------------------------------------

  if (!isValidGpsPoint(newPoint)) {
    return {
      accepted: false,
      distance: Infinity,
      reason: "INVALID_POINT",
    };
  }

  // ----------------------------------------------------------
  // First point
  // ----------------------------------------------------------

  if (!isValidGpsPoint(previousPoint)) {
    return {
      accepted: true,
      distance: 0,
      reason: "FIRST_POINT",
    };
  }

  // ----------------------------------------------------------
  // Calculate distance
  // ----------------------------------------------------------

  const distance = distanceBetweenPoints(previousPoint, newPoint);

  // ----------------------------------------------------------
  // GPS jitter
  // ----------------------------------------------------------

  if (distance < minimumDistanceMeters) {
    return {
      accepted: false,
      distance,
      reason: "GPS_JITTER",
    };
  }

  // ----------------------------------------------------------
  // Impossible jump
  // ----------------------------------------------------------

  if (distance > maximumJumpMeters) {
    return {
      accepted: false,
      distance,
      reason: "GPS_JUMP",
    };
  }

  // ----------------------------------------------------------
  // Real movement
  // ----------------------------------------------------------

  return {
    accepted: true,
    distance,
    reason: "REAL_MOVEMENT",
  };
};

// ============================================================
// ADD TRACKING POINT
// ============================================================

export const addTrackingPoint = (
  existingPoints,
  newPoint,
  currentLocation,
  options = {},
) => {
  const {
    minimumDistanceMeters = GPS_CONFIG.MIN_MOVEMENT_METERS,

    maximumJumpMeters = GPS_CONFIG.MAX_JUMP_METERS,

    radiusMeters = GPS_CONFIG.MAX_RADIUS_METERS,

    maximumPoints = GPS_CONFIG.MAX_TRACK_POINTS,
  } = options;

  const points = Array.isArray(existingPoints) ? existingPoints : [];

  // ----------------------------------------------------------
  // Invalid
  // ----------------------------------------------------------

  if (!isValidGpsPoint(newPoint)) {
    return {
      points,
      accepted: false,
      distance: Infinity,
      reason: "INVALID_POINT",
    };
  }

  // ----------------------------------------------------------
  // First point
  // ----------------------------------------------------------

  if (points.length === 0) {
    return {
      points: [newPoint],
      accepted: true,
      distance: 0,
      reason: "FIRST_POINT",
    };
  }

  const lastPoint = points[points.length - 1];

  // ----------------------------------------------------------
  // Distance from last accepted route point
  // ----------------------------------------------------------

  const distance = distanceBetweenPoints(lastPoint, newPoint);

  // ----------------------------------------------------------
  // GPS jitter
  // ----------------------------------------------------------

  if (distance < minimumDistanceMeters) {
    return {
      points,
      accepted: false,
      distance,
      reason: "GPS_JITTER",
    };
  }

  // ----------------------------------------------------------
  // Large jump
  // ----------------------------------------------------------

  if (distance > maximumJumpMeters) {
    return {
      points,
      accepted: false,
      distance,
      reason: "GPS_JUMP",
    };
  }

  // ----------------------------------------------------------
  // 500m radius
  // ----------------------------------------------------------

  if (isValidLocation(currentLocation)) {
    const distanceFromCurrent = distanceFromLocation(currentLocation, newPoint);

    if (distanceFromCurrent > radiusMeters) {
      return {
        points,
        accepted: false,
        distance,
        reason: "OUTSIDE_RADIUS",
      };
    }
  }

  // ----------------------------------------------------------
  // ACCEPT
  // ----------------------------------------------------------

  const updatedPoints = [...points, newPoint];

  return {
    points: updatedPoints.slice(-maximumPoints),

    accepted: true,

    distance,

    reason: "REAL_MOVEMENT",
  };
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  isValidGpsPoint,
  isValidLocation,
  distanceBetweenPoints,
  distanceFromLocation,
  locationToPoint,
  filterPointsWithinRadius,
  thinTrail,
  limitTrackPoints,
  processTrackPoints,
  evaluateMovement,
  addTrackingPoint,
};
