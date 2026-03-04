/**
 * LevelProgressBar Component Tests (Story 37.3)
 *
 * Tests for the level progress bar including XP mode display,
 * milestone mode display, max level badge, and tooltip formatting.
 */

import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { LevelProgressBar } from '../LevelProgressBar'

describe('LevelProgressBar', () => {
  describe('XP mode', () => {
    it('should render a progress bar in XP mode', () => {
      renderWithProviders(
        <LevelProgressBar currentXP={150} currentLevel={1} mode="xp" />
      )
      expect(screen.getByTestId('xp-progress-bar')).toBeInTheDocument()
    })

    it('should show percentage for level 1 with 150 XP', () => {
      renderWithProviders(
        <LevelProgressBar currentXP={150} currentLevel={1} mode="xp" />
      )
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('should display tooltip with XP progress details', () => {
      renderWithProviders(
        <LevelProgressBar currentXP={150} currentLevel={1} mode="xp" />
      )
      // The outer wrapper div has the title attribute for tooltip
      const wrapper = screen.getByLabelText(/Level progress/)
      expect(wrapper).toHaveAttribute('title', expect.stringContaining('150'))
      expect(wrapper).toHaveAttribute('title', expect.stringContaining('300'))
      expect(wrapper).toHaveAttribute('title', expect.stringContaining('50%'))
    })

    it('should show 0% for level 1 with 0 XP', () => {
      renderWithProviders(
        <LevelProgressBar currentXP={0} currentLevel={1} mode="xp" />
      )
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should show correct level label', () => {
      renderWithProviders(
        <LevelProgressBar currentXP={5000} currentLevel={4} mode="xp" />
      )
      expect(screen.getByText('Lv.4')).toBeInTheDocument()
    })

    it('should apply gold color when within 20% of next level threshold', () => {
      // Level 1 threshold is 300. 80% of 300 = 240. At 260, should be near (86% progress).
      renderWithProviders(
        <LevelProgressBar currentXP={260} currentLevel={1} mode="xp" />
      )
      const bar = screen.getByTestId('xp-progress-bar').firstChild
      expect(bar).toHaveClass('bg-accent-gold')
    })

    it('should apply green color when far from next level', () => {
      renderWithProviders(
        <LevelProgressBar currentXP={50} currentLevel={1} mode="xp" />
      )
      const bar = screen.getByTestId('xp-progress-bar').firstChild
      expect(bar).toHaveClass('bg-green-500')
    })

    it('should have ARIA progressbar role with correct values', () => {
      renderWithProviders(
        <LevelProgressBar currentXP={150} currentLevel={1} mode="xp" />
      )
      const progressbar = screen.getByTestId('xp-progress-bar')
      expect(progressbar).toHaveAttribute('role', 'progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '50')
      expect(progressbar).toHaveAttribute('aria-valuemin', '0')
      expect(progressbar).toHaveAttribute('aria-valuemax', '100')
    })
  })

  describe('Max level', () => {
    it('should show "MAX LEVEL" badge for level 20 characters', () => {
      renderWithProviders(
        <LevelProgressBar currentXP={400000} currentLevel={20} mode="xp" />
      )
      expect(screen.getByTestId('max-level-badge')).toBeInTheDocument()
      expect(screen.getByText('MAX LEVEL')).toBeInTheDocument()
    })

    it('should not show progress bar for level 20', () => {
      renderWithProviders(
        <LevelProgressBar currentXP={400000} currentLevel={20} mode="xp" />
      )
      expect(screen.queryByTestId('xp-progress-bar')).not.toBeInTheDocument()
    })
  })

  describe('Milestone mode', () => {
    it('should display "Level [N] -- Milestone" for milestone campaigns', () => {
      renderWithProviders(
        <LevelProgressBar currentXP={0} currentLevel={5} mode="milestone" />
      )
      expect(screen.getByTestId('milestone-label')).toBeInTheDocument()
      expect(screen.getByText(/Level 5/)).toBeInTheDocument()
      expect(screen.getByText(/Milestone/)).toBeInTheDocument()
    })

    it('should not show progress bar in milestone mode', () => {
      renderWithProviders(
        <LevelProgressBar currentXP={0} currentLevel={5} mode="milestone" />
      )
      expect(screen.queryByTestId('xp-progress-bar')).not.toBeInTheDocument()
    })

    it('should display correct level number', () => {
      renderWithProviders(
        <LevelProgressBar currentXP={0} currentLevel={12} mode="milestone" />
      )
      expect(screen.getByText(/Level 12/)).toBeInTheDocument()
    })
  })
})
