import { OrderStatus, UserRole } from "../../generated/prisma/client";
import { ApiError } from "../../shared/utils/ApiError";

/**
 * Order State Machine
 *
 * Defines valid state transitions and who can trigger them.
 *
 * Flow: PLACED → CONFIRMED → PREPARING → READY → PICKED_UP → DELIVERED
 *                                                              ↗
 * Any non-terminal state → CANCELLED
 */

type Transition = {
  from: OrderStatus[];
  allowedRoles: UserRole[];
};

const transitions: Record<OrderStatus, Transition> = {
  PLACED: { from: [], allowedRoles: [] }, // Initial state, created by system
  CONFIRMED: {
    from: [OrderStatus.PLACED],
    allowedRoles: [UserRole.RESTAURANT_OWNER, UserRole.ADMIN],
  },
  PREPARING: {
    from: [OrderStatus.CONFIRMED],
    allowedRoles: [UserRole.RESTAURANT_OWNER, UserRole.ADMIN],
  },
  READY: {
    from: [OrderStatus.PREPARING],
    allowedRoles: [UserRole.RESTAURANT_OWNER, UserRole.ADMIN],
  },
  PICKED_UP: {
    from: [OrderStatus.READY],
    allowedRoles: [UserRole.DRIVER, UserRole.ADMIN],
  },
  DELIVERED: {
    from: [OrderStatus.PICKED_UP],
    allowedRoles: [UserRole.DRIVER, UserRole.ADMIN],
  },
  CANCELLED: {
    from: [OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PREPARING],
    allowedRoles: [UserRole.CUSTOMER, UserRole.RESTAURANT_OWNER, UserRole.ADMIN],
  },
};

export function validateTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  userRole: UserRole,
): void {
  const transition = transitions[newStatus];

  if (!transition.from.includes(currentStatus)) {
    throw ApiError.badRequest(
      `Cannot transition from ${currentStatus} to ${newStatus}`,
    );
  }

  if (!transition.allowedRoles.includes(userRole)) {
    throw ApiError.forbidden(
      `Role ${userRole} cannot transition order to ${newStatus}`,
    );
  }
}
