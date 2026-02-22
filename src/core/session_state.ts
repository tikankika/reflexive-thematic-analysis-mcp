/**
 * SessionState - Singleton for tracking session state
 *
 * Used to enforce that init() is called before other tools.
 * This ensures Claude Desktop receives critical instructions
 * before attempting to use coding tools.
 */

class SessionState {
  private static instance: SessionState;
  private _initCalled: boolean = false;
  private _configPath: string | null = null;
  private _currentPhase: string | null = null;

  /**
   * Get singleton instance
   */
  static getInstance(): SessionState {
    if (!SessionState.instance) {
      SessionState.instance = new SessionState();
    }
    return SessionState.instance;
  }

  /**
   * Mark that init() has been called
   */
  markInitCalled(): void {
    this._initCalled = true;
  }

  /**
   * Check if init() has been called
   */
  isInitCalled(): boolean {
    return this._initCalled;
  }

  /**
   * Require init() to have been called, throw if not
   * Use this in tools that need init() first
   */
  requireInit(): void {
    if (!this._initCalled) {
      throw new Error(
        "🛑 STOP! You MUST call 'init' first.\n" +
          'Call: init()\n' +
          'Then you can use other tools.'
      );
    }
  }

  /**
   * Set the current project config path
   */
  setConfigPath(path: string): void {
    this._configPath = path;
  }

  /**
   * Get the current project config path
   */
  getConfigPath(): string | null {
    return this._configPath;
  }

  /**
   * Set current phase
   */
  setCurrentPhase(phase: string | null): void {
    this._currentPhase = phase;
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): string | null {
    return this._currentPhase;
  }

  /**
   * Reset for testing purposes
   */
  reset(): void {
    this._initCalled = false;
    this._configPath = null;
    this._currentPhase = null;
  }
}

export const sessionState = SessionState.getInstance();
