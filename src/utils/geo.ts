import type { IBranch, IBranchWithDistance } from '../models/branch.model';

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const findNearestBranch = (
  userLat: number,
  userLon: number,
  branches: IBranch[],
): IBranchWithDistance | null => {
  let nearestBranch: IBranchWithDistance | null = null;
  let shortestDistance = Infinity;

  branches.forEach((branch) => {
    const distance = haversineDistance(userLat, userLon, branch.location.lat, branch.location.lng);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestBranch = { ...branch, distance };
    }
  });

  return nearestBranch;
};

export { findNearestBranch };
