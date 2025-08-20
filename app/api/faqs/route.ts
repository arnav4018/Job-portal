import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

// GET /api/faqs - Get FAQs by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let where: any = { isActive: true }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        {
          question: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          answer: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ faqs })
  } catch (error) {
    console.error('FAQs fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    )
  }
}

// POST /api/faqs - Create new FAQ (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { question, answer, category, order = 0 } = body

    if (!question || !answer || !category) {
      return NextResponse.json(
        { error: 'Question, answer, and category are required' },
        { status: 400 }
      )
    }

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category,
        order,
        isActive: true,
      },
    })

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'faq',
      resourceId: faq.id,
      newData: JSON.stringify(faq),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json(faq, { status: 201 })
  } catch (error) {
    console.error('FAQ creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    )
  }
}