import { Controller, Post, Body, UseGuards, Logger, Version } from '@nestjs/common';
import { FaqService } from './faq.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Optional, if FAQ is for logged-in users
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AskFaqDto } from './dto/ask-faq.dto';

@ApiTags('FAQ')
@Controller('faq')
export class FaqController {
  private readonly logger = new Logger(FaqController.name);
  constructor(private readonly faqService: FaqService) {}

  @Post('ask')
  @Version('1')
  // @UseGuards(JwtAuthGuard) // Uncomment if this endpoint should be protected
  @ApiOperation({ summary: 'Ask a question to the FAQ system' })
  @ApiBody({ type: AskFaqDto })
  @ApiResponse({ status: 200, description: 'Answer from the FAQ system.'})
  @ApiResponse({ status: 503, description: 'FAQ service unavailable (e.g., API key not configured).'})
  @ApiResponse({ status: 500, description: 'Internal server error during AI interaction.' })
  async askQuestion(@Body() body: AskFaqDto): Promise<{ answer: string }> {
    this.logger.debug(`Received question for FAQ: "${body.question}"`);
    const answer = await this.faqService.answerQuestion(body.question);
    return { answer };
  }
} 